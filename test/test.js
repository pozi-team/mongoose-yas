const mongoose = require('mongoose')
const slugGenerator = require('../.')
const chai = require('chai')
const should = chai.should()

mongoose.connect('mongodb://localhost:27017/mongoose-yas')

const Schema = new mongoose.Schema({
  title: {type: String},
  friendlySlugs: Object,
  publisher: {type: String, default: 'PUB_1'},
  slug: {type: String, slugFrom: 'title', distinctUpTo: ['publisher']},
})
Schema.plugin(slugGenerator)
const Book = mongoose.model('Book', Schema)

describe('Normal usage', function () {
  before(function (done) {
    Book.remove({}, function () {
      done()
    })
  })

  after(function (done) {
    Book.remove({}, function () {
      done()
    })
  })

  it('Creates a slug', function (done) {
    Book.create({
      title: 'i ♥ unicode',
      publisher: 'PUB_1'
    }, function (err, doc) {
      should.not.exist(err)
      should.exist(doc)
      doc.should.have.property('slug').and.equal('i-love-unicode')
      doc.should.have.property('friendlySlugs').and.deep.equal({
        slug: {
          base: 'i-love-unicode',
          index: 0,
        }
      })
      done()
    })
  })

  it('Adds a prefix to second slug', function (done) {
    Book.create({
      title: 'i ♥ unicode',
      publisher: 'PUB_1'
    }, function (err, doc) {
      should.not.exist(err)
      should.exist(doc)
      doc.should.have.property('slug').and.equal('i-love-unicode-1')
      doc.should.have.property('friendlySlugs').and.deep.equal({
        slug: {
          base: 'i-love-unicode',
          index: 1,
        }
      })
      done()
    })
  })

  it('Updates slug when title changed', function (done) {
    const title = 'A new book'
    const newTitle = 'An old book'

    Book.create({
      title: title,
    }, function (err, doc) {
      should.not.exist(err)
      should.exist(doc)
      doc.should.have.property('slug').and.equal('a-new-book')
      doc.should.have.property('friendlySlugs').and.deep.equal({
        slug: {
          base: 'a-new-book',
          index: 0,
        }
      })

      doc.title = newTitle
      doc.save(function (err, doc) {
        doc.should.have.property('slug').and.equal('an-old-book')
        doc.should.have.property('friendlySlugs').and.deep.equal({
          slug: {
            base: 'an-old-book',
            index: 0,
          }
        })
        done()
      })
    })
  })
})