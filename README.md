# Chico UI  ![Get things done, quickly.](http://isitmaintained.com/badge/resolution/mercadolibre/chico.svg "Get things done, quickly.")

Chico UI is a free and open source collection of easy-to-use UI components for designers and developers.


> Get things done, quickly.

## Development setup
1. Install [Git](http://git-scm.com/) and [NodeJS](http://nodejs.org/).
2. Open your terminal and clone `mercadolibre/chico` by running:

        $ git clone git@github.com:mercadolibre/chico.git

3. Now go to the project's folder:

        $ cd chico

4. Install its dependencies:

        $ npm install

5. Install `grunt-cli`:

        $ npm install grunt-cli -g

6. Run a local web server:

        $ npm start

    Navigate [http://localhost:3040](http://localhost:3040/) and [http://localhost:3040/mobile](http://localhost:3040/mobile).

7. Develop! :)

**NOTE**

Please read through our code style guides:
- [HTML](https://github.com/mercadolibre/html-style-guide)
- [CSS](https://github.com/mercadolibre/css-style-guide)
- [JavaScript](https://github.com/mercadolibre/javascript-style-guide)

## API Doc

[Temporally] Before run grunt doc, change [this file](https://github.com/ibarbieri/chico/blob/master/node_modules/grunt-jsdoc/node_modules/jsdoc/lib/jsdoc/util/templateHelper.js#L199) with:

    else {

        var newUrl = url.replace('ch.', '/chico/api-doc/'+options.cssClass+'/');
        newUrl = newUrl.toLowerCase();
        newUrl = newUrl.replace('.html', '');

        return util.format('<a href="%s%s"%s>%s</a>', newUrl, fragmentString, classString, text);
    }

You can read our [API Doc](http://chico.mercadolibre.com/).

The API doc may also be run locally by running:

    grunt doc

Navigate `./api-doc/version` directory and enjoy!


## API Doc to gh-pages

You can publish the API Doc to gh-pages following these steps:

1. Run locally from master branch:

		$ grunt docToSite

2. Run locally from gh-pages branch:

		$ git pull origin gh-pages
        $ npm install
        $ grunt getVersion
		$ jekyll build

3. Commit and push the updates files


## Tests
You can run our tests in your browser:

1. Run the local web server:

        $ npm start

2. Navigate `http://localhost:3040/test/:component`

**We are going to automate it! :)**

## Get in touch

- E-mail: [chico at mercadolibre dot com](mailto:chico@mercadolibre.com)
- Twitter: [@chicoui](https://twitter.com/chicoui)
- Web: http://chico-ui.com.ar/

## Maintained by

- Her Mammana ([@hmammana](https://twitter.com/hmammana))
- Lean Linares ([@lean8086](https://twitter.com/lean8086))

## Thanks to

- Guille Paz ([@pazguille](https://twitter.com/pazguille)).
- Natan Santolo ([@natos](https://twitter.com/natos)). Creator and former leader, now traveling around the world, drinking beer and looking for the secret of eternal life.
- Nati Devalle ([@taly](https://twitter.com/taly)). Because we love her. She is awesome!


## Credits

![MercadoLibre](http://static.mlstatic.com/org-img/chico/img/logo-mercadolibre-new.png)

## License
Licensed under the MIT license.

Copyright (c) 2014 [MercadoLibre](http://github.com/mercadolibre).
