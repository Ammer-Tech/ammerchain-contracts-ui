module.exports = {
  apps: [{
    name: 'ac-contracts-manager',
    script: 'server.js',
    watch: '.',
    env_production: {
      NODE_ENV: 'production'
    },
    env_development: {
      NODE_ENV: 'development'
    }
  }, {
    UVICORN
    name: 'nft-api-server',
    script: '../nft-api/server.py',
    watch: ['../nft-api'],
    env_production: {
      NODE_ENV: 'production'
    },
    env_development: {
      NODE_ENV: 'development'
    }
  }]
}
