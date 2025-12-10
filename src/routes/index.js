const router = require('express').Router()
const https = require('https');
const users = require('./users')
const SuratMasuk = require('./suratMasuk')
const Suratkeluar = require('./suratKeluar')
const jabatan = require('./Jabatan')
const jenisSurat = require('./JenisSurat')
const pegawai = require('./Pegawai')

router.use('/user', users)
router.use('/surat-masuk', SuratMasuk)
router.use('/surat-keluar', Suratkeluar)
router.use('/jabatan', jabatan)
router.use('/jenis-surat', jenisSurat)
router.use('/pegawai', pegawai)

router.get('/download', async (req, res) => {
  const fileUrl = req.query.url;

  if (!fileUrl) {
    return res.status(400).json({ message: 'URL file tidak diberikan.' });
  }

  const decodedUrl = decodeURIComponent(fileUrl);
  const filename = decodedUrl.split('/').pop() || 'file.pdf';

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/pdf');

  https.get(decodedUrl, fileRes => {
    fileRes.pipe(res);
  }).on('error', err => {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengunduh file.' });
  });
});

module.exports = router