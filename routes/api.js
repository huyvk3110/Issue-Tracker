/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app, db) {
  app.route('/api/issues/:project')
    .get(function (req, res) {
      const { project } = req.params;
      const { created_on, updated_on, open, _id, issue_title, issue_text, created_by, assigned_to, status_text, username } = req.query;

      const query = { created_on, updated_on, open, _id: _id ? new ObjectId(_id) : undefined, issue_title, issue_text, created_by, assigned_to, status_text, username };
      for (const key in query) if (!query[key]) delete query[key];

      db.collection(project).findOne(query)
        .then(user => res.json(user))
        .catch(err => res.json({ error: err }))
    })

    .post(function (req, res) {
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      var project = req.params.project;

      if (!issue_title || !issue_text || !created_by) res.json({ error: 'error' });
      db.collection(project).insertOne(
        {
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text,
          open: true,
          created_on: new Date(),
          updated_on: new Date(),
        })
        .then(data => {
          res.json(data.ops[0])
        })
        .catch(err => res.json({ error: 'error' }))
    })

    .put(function (req, res) {
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
      var project = req.params.project;

      if (!_id) return res.json({ error: 'error' });

      db.collection(project).findOne({ _id: new ObjectId(_id) })
        .then(data => {
          if (!data) return res.json({ error: 'error' });

          const query = { issue_title, issue_text, created_by, assigned_to, status_text, open };
          for (const key in query) if (!query[key]) delete query[key];
          data = Object.assign({}, data, query);

          db.collection(project).updateOne({ _id: new ObjectId(_id) }, data)
            .then(dat => res.json(data))
            .catch(err => res.json({ error: 'error' }))
        })
        .catch(error => res.json({ error: 'error' }));
    })

    .delete(function (req, res) {
      const {_id} = req.body;
      var project = req.params.project;

      if(!_id) return res.json({error: 'error'});
      db.collection(project).deleteOne({_id: new ObjectId(_id)})
        .then(data=>res.json({success: 'OK'}))
        .catch(error=>res.json({error: 'Error'}))
    });
};
