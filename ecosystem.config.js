module.exports = {
  apps: [
    {
      name: 'ammerchain-contracts-manager',
      script: 'server.js',
      watch: '.'
    },
    {
      name: 'contracts2assets-api',
      script: '../contrats2assets-api/main.py',
      watch: ['../contrats2assets-api']
    }
  ]
}
