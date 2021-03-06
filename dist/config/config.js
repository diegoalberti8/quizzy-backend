'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var configuration = {
  development: {
    database: {
      host: '127.0.0.1',
      port: '27017',
      db: 'quizzy-backend'
    },
    server: {
      host: 'localhost',
      port: '3000'
    }
  },
  test: {
    database: {
      host: '127.0.0.1',
      port: '27017',
      db: 'quizzy-backend-test'
    },
    server: {
      host: 'localhost',
      port: '3000'
    }
  },
  production: {
    database: {
      host: '172.31.58.67',
      port: '27017',
      db: 'quizzy-backend'
    },
    server: {
      host: '172.31.25.108',
      port: '3000'
    }
  }
};

exports.default = configuration;
//# sourceMappingURL=config.js.map