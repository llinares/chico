# Chico UI Site

[Browse site (Production)](http://chico.mercadolibre.com)

## Install

1. Get [Ruby 2.1.2 or higher](https://www.ruby-lang.org/en/installation/).
2. Get [RubyGems](https://rubygems.org/pages/download).
3. Get [Jekyll](http://jekyllrb.com/): ```gem install jekyll```

## Build site
```
$ jekyll build```

## Browse site (local)
```
$ jekyll serve```

## Generate API Doc

Go to branch `master` and run:

```
$ grunt docToSite```

Then, go to branch `gh-pages` and run:

```
$ git pull origin gh-pages
$ npm install
$ grunt getVersion
$ jekyll build```

Commit and push the updated files.
