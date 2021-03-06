import chai, {
  expect,
  request
} from 'chai';
import chaiHttp from 'chai-http';
import factory from '../factories/factory.js';
import app from '../../server.js';
import mongoose from 'mongoose';
import Match from '../../app/models/match';
import Game from '../../app/models/game';

chai.use(chaiHttp);

describe('MatchesController', () => {
  let match;
  let match2;

  beforeEach(function(done) {
    factory.createMany('match', 2, [{
        url: 'testURL'
      }, {
        url: 'testURL2'
      }])
      .then(matchArray => {
        match = matchArray[0];
        match2 = matchArray[1];
        done();
      })
  });

  afterEach(function(done) {
    Match.remove({}, function() {
      done();
    });
  });

  describe('index', () => {
    it('returns 200', (done) => {
      request(app).get('/matches')
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('returns the right json object', (done) => {
      request(app).get('/matches')
        .end((err, res) => {
          expect(res.body.matches[0])
            .to.have.keys('id', 'url', 'isRealTime', 'started',
              'owner', 'endingDate', 'game', 'result');
          done();
        });
    });
  });

  describe('Landing', () => {
    it('returns 200', (done) => {
      request(app).get('/matches/landing')
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('returns the right json object', (done) => {
      var cant = 0;
      if (!match.isRealTime) {
        cant = cant + 1;
      }
      if (!match2.isRealTime) {
        cant = cant + 1;
      }
      request(app).get('/matches/landing')
        .end((err, res) => {
          expect(res.body)
            .to.have.keys('matches');
          expect(res.body.matches.length).to.eq(cant);
          if (cant !== 0) {
            expect(res.body.matches[0])
              .to.have.keys('id', 'url', 'isRealTime',
                'owner', 'game');
          }
          done();
        });
    });
  });

  describe('show', () => {
    it('returns 200', (done) => {
      request(app).get(`/matches/${match.url}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('returns the right json object', (done) => {
      request(app).get(`/matches/${match.url}`)
        .end((err, res) => {
          expect(res.body.match)
            .to.have.keys('id', 'url', 'isRealTime', 'started',
              'owner', 'endingDate', 'game', 'result');
          done();
        });
    });

    it('non-existent variable', (done) => {
      request(app).get(`/matches/${match.url}?var=ranking`)
        .end((err, res) => {
          expect(res.body.match)
            .to.have.keys('id', 'url', 'isRealTime', 'started',
              'owner', 'endingDate', 'game', 'result');
          done();
        });
    });

    it('returns 200', (done) => {
      request(app).get(`/matches/${match.id}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('returns the right json object', (done) => {
      request(app).get(`/matches/${match.id}`)
        .end((err, res) => {
          expect(res.body.match)
            .to.have.keys('id', 'url', 'isRealTime', 'started',
              'owner', 'endingDate', 'game', 'result');
          done();
        });
    });

    it('non-existent variable', (done) => {
      request(app).get(`/matches/${match.id}?cosa`)
        .end((err, res) => {
          expect(res.body.match)
            .to.have.keys('id', 'url', 'isRealTime', 'started',
              'owner', 'endingDate', 'game', 'result');
          done();
        });
    });
    //find match that does not exist
    it('returns 404', (done) => {
      request(app).get(`/matches/0000000`)
        .end((res) => {
          expect(res).to.have.status(404);
          done();
        });
    });

    it('Show ranking returns 200', (done) => {
      request(app).get(`/matches/${match.id}?v=ranking`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('Show ranking', (done) => {
      request(app).get(`/matches/${match.id}?v=ranking`)
        .end((err, res) => {
          expect(res.body[0])
            .to.have.keys('user', 'points', '_id');
          done();
        });
    });

    it('Show ranking returns 422', (done) => {
      request(app).get(`/matches/020202?v=ranking`)
        .end((err, res) => {
          expect(res).to.have.status(422);
          done();
        });
    });

    it('Show isRealTime returns 200', (done) => {
      request(app).get(`/matches/${match.id}?v=isReal`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('Show isRealTime returns 404', (done) => {
      request(app).get(`/matches/020202?v=isReal`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  describe('create', () => {
    context('with valid params', () => {
      let params;
      factory.attrs('match')
        .then(attrs => {
          params = {
            match: attrs
          };
        })

      it('returns 201', (done) => {
        request(app).post('/matches')
          .send(params)
          .end((err, res) => {
            expect(res).to.have.status(201);
            done();
          });
      });

      it('creates a match', (done) => {
        request(app).post('/matches')
          .send(params)
          .end((err, res) => {
            Match.count({}).exec((err, count) => {
              expect(count).to.eq(3);
              done();
          });
        });
      });
    });

    context('with invalid params', () => {
      let params;
      factory.attrs('match', {
          url: 'testURL'
        })
        .then(attrs => {
          params = {
            match: attrs
          };
        })

      it('returns 422', (done) => {
        request(app).post('/matches')
          .send(params)
          .end((err, res) => {
            expect(res).to.have.status(422);
            done();
          });
      });

      it('does not create a match', (done) => {
        request(app).post('/matches')
          .send(params)
          .end((err, res) => {
            Match.count({}).exec((err, count) => {
              expect(count).to.eq(2);
              done();
          });
        });
      });
    })
  });

  describe('update', () => {
    context('with valid params', () => {
      let params;
      factory.attrs('match', {
          url: 'updatedURL'
        })
        .then(attrs => {
          params = {
            match: attrs
          };
        })

      it('returns 200', (done) => {
        request(app).put(`/matches/${match.id}`)
          .send(params)
          .end((err, res) => {
            expect(res).to.have.status(200);
            done();
          });
      });

      it('updates a match', (done) => {
        request(app).put(`/matches/${match.id}`)
          .send(params)
          .end((err, res) => {
            Match.findById(match.id).lean().exec((err, match) => {
              expect(match.url).to.eq('updatedURL');
              done();
            });
          });
      });
    });

    context('with invalid params', () => {
      let params;
      factory.attrs('match', {
          url: 'testurl2'
        })
        .then(attrs => {
          params = {
            match: attrs
          };
        })

      it('returns 422', (done) => {
        request(app).put(`/matches/${match.id}`)
          .send(params)
          .end((err, res) => {
            expect(res).to.have.status(422);
            done();
          });
      });

      it('does not update a match', (done) => {
        request(app).put(`/match/${match.id}`)
          .send(params)
          .end((err, res) => {
            Match.findById(match.id).lean().exec((err, match) => {
              expect(match.url).to.eq('testurl');
              done();
            });
          });
      });
    });
  });

  describe('update Ranking', () => {
    context('with ranking not empty', () => {
      let params1 = {
        user: 'sebas',
        points: 99999
      }

      let params2 = {
        user: 'sebas',
        points: 0
      }

      it('insert in first place', (done) => {
        request(app).get(`/matches/testurl2`)
        .end((err, res) => {
          request(app).put(`/matches/${res.body.match.id}`)
          .send(params1)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body[0].user).to.eq('sebas');
            expect(res.body[0].points).to.eq(99999);
            done();
          });
        });
      });

      it('insert in last place', (done) => {
        request(app).get(`/matches/testurl2`)
        .end((err, res) => {
          request(app).put(`/matches/${res.body.match.id}`)
          .send(params2)
          .end((err, res) => {
            expect(res).to.have.status(200);
            let length = res.body.length;
            expect(res.body[length-1].user).to.eq('sebas');
            expect(res.body[length-1].points).to.eq(0);
            done();
          });
        });
      });

      it('Match do not exist', (done) => {
        request(app).get(`/matches/unMatch`)
        .end((err, res) => {
          request(app).put(`/matches/${res.body.match.id}`)
          .send(params2)
          .end((err, res) => {
            expect(res).to.have.status(422);
            done();
          });
        });
      });

      it('Bad request', (done) => {
        request(app).get(`/matches/testurl2`)
        .end((err, res) => {
          request(app).put(`/matches/${res.body.match.id}`)
          .send()
          .end((err, res) => {
            expect(res).to.have.status(404);
            done();
          });
        });
      });
    });
  });

  describe('destroy', () => {
    it('returns 204', (done) => {
      request(app).delete(`/matches/${match.id}`)
        .end((err, res) => {
          expect(res).to.have.status(204);
          done();
        });
    });

    it('deletes the right match', (done) => {
      request(app).delete(`/matches/${match.id}`)
        .end((err, res) => {
          Match.findById(match.id).lean().exec((err, match) => {
            expect(match).to.eq(null);
            done();
          });
        });
    });
    //destroy match that does not exist
    it('returns 404', (done) => {
      request(app).delete(`/matches/000000`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  })

  describe('set Started', () => {
    it('set true', (done) => {
      request(app).get(`/matches/testurl2`)
      .end((err, res) => {
        let id = res.body.match.id;
        request(app).put(`/matches/${id}`)
        .send( { started: true } )
        .end((err, res) => {
          expect(res).to.have.status(200);
          request(app).get(`/matches/${id}`)
          .end((err, res) => {
            expect(res.body.match.started).to.eq(true);
            done();
          });
        });
      });
    });

    it('set false', (done) => {
      request(app).get(`/matches/testurl2`)
      .end((err, res) => {
        let id = res.body.match.id;
        request(app).put(`/matches/${id}`)
        .send( { started: false } )
        .end((err, res) => {
          expect(res).to.have.status(200);
          request(app).get(`/matches/${id}`)
          .end((err, res) => {
            expect(res.body.match.started).to.eq(false);
            done();
          });
        });
      });
    });

    it('Match do not exist', (done) => {
      request(app).put(`/matches/0000000`)
      .send( { started: true } )
      .end((err, res) => {
        expect(res).to.have.status(422);
        done();
      });
    });

    it('Bad request', (done) => {
      request(app).get(`/matches/testurl2`)
      .end((err, res) => {
        request(app).put(`/matches/${res.body.match.id}`)
        .send()
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
      });
    });
  });
  
  describe('Errors', () => {
    context('more one error', () => {
      let match_1;
      let match_2;
      let match_3;
      let match_4;
      let match_5;
      let match_6;
      let match_7;
      let match_8;
      let match_9;
      let match_10;
      let match_11;
      
      factory.attrsMany('match', 11, [
      {
        url: null, 
        isRealTime: null,
        started: null,
        owner: null, 
        result: [
          { points: 3 }, 
          { user: 'user' }
        ], 
        endingDate: 'el dia de hoy',
        game: null
      }, {
        url: 's e b a s', 
        isRealTime: null,
        started: null,
        owner: null, 
        result: [
          { points: 3 }, 
          { user: 'user' }
        ], 
        endingDate: 'el dia de hoy',
        game: null
      }, { 
        isRealTime: null,
        started: null,
        owner: null, 
        result: [
          { points: 3 }, 
          { user: 'user' }
        ], 
        endingDate: 'el dia de hoy',
        game: null
      }, {
        owner: null, 
        result: [
          { points: 3 }, 
          { user: 'user' }
        ], 
        endingDate: 'el dia de hoy',
        game: null
      }, { 
        result: [
          { points: 3 }, 
          { user: 'user' }
        ], 
        endingDate: 'el dia de hoy',
        game: null
      }, { 
        result: [
          { user: 'user' }
        ], 
        endingDate: 'el dia de hoy',
        game: null
      }, { 
        endingDate: 'el dia de hoy',
        game: null
      }, {
        game: null
      }, {
        game: { }
      }, {
        url: 'testURL'
      }, { 
        started: null, 
        owner: null, 
        result: [
          { points: 3 }, 
          { user: 'user' }
        ], 
        endingDate: 'el dia de hoy',
        game: null
      }])
      .then(matchAttrsArray => {
        match_1 = { match: matchAttrsArray[0] };
        match_2 = { match: matchAttrsArray[1] };
        match_3 = { match: matchAttrsArray[2] };
        match_4 = { match: matchAttrsArray[3] };
        match_5 = { match: matchAttrsArray[4] };
        match_6 = { match: matchAttrsArray[5] };
        match_7 = { match: matchAttrsArray[6] };
        match_8 = { match: matchAttrsArray[7] };
        match_9 = { match: matchAttrsArray[8] };
        match_10 = { match: matchAttrsArray[9] };
        match_11 = { match: matchAttrsArray[10] };
      })

      it('return correct error', (done) => {
        request(app).post('/matches')
          .send(match_1)
          .end((err, res) => {
            expect(res.body.error).to.eq('You must enter a url');
            done();
          });
      });

      it('return correct error', (done) => {
        request(app).post('/matches')
          .send(match_2)
          .end((err, res) => {
            expect(res.body.error).to.eq('Invalid url');
            done();
          });
      });

      it('return correct error', (done) => {
        request(app).post('/matches')
          .send(match_3)
          .end((err, res) => {
            expect(res.body.error).to.eq('You must enter a type of match');
            done();
          });
      });

      it('return correct error', (done) => {
        request(app).post('/matches')
          .send(match_11)
          .end((err, res) => {
            expect(res.body.error).to.eq('you must enter a state');
            done();
          });
      });

      it('return correct error', (done) => {
        request(app).post('/matches')
          .send(match_4)
          .end((err, res) => {
            expect(res.body.error).to.eq('Must have an owner');
            done();
          });
      });

      it('return correct error', (done) => {
        request(app).post('/matches')
          .send(match_5)
          .end((err, res) => {
            expect(res.body.error).to.eq('Result must have a user');
            done();
          });
      });

      it('return correct error', (done) => {
        request(app).post('/matches')
          .send(match_6)
          .end((err, res) => {
            expect(res.body.error).to.eq('Result must have points');
            done();
          });
      });

      it('return correct error', (done) => {
        request(app).post('/matches')
          .send(match_7)
          .end((err, res) => {
            expect(res.body.error).to.eq('Invalid date');
            done();
          });
      });

      it('return correct error', (done) => {
        request(app).post('/matches')
          .send(match_8)
          .end((err, res) => {
            expect(res.body.error).to.eq('There must be a game');
            done();
          });
      });

      it('return correct error', (done) => {
        request(app).post('/matches')
          .send(match_9)
          .end((err, res) => {
            expect(res.body.error).to.eq('Error in the definition of the game');
            done();
          });
      });

      it('return correct error', (done) => {
        request(app).post('/matches')
          .send(match_10)
          .end((err, res) => {
            expect(res.body.error).to.eq('The url already exists');
            done();
          });
      });
    });
  });
});
