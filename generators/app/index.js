'use strict';
const Generator = require('yeoman-generator');

const chalk = require('chalk');
const jsonfile = require('jsonfile')
const find_up = require('find-up');
const request = require('request');
const snake_case = require('snake-case');
const yosay = require('yosay');
const shelljs = require('shelljs');
const svn_ultimate = require('node-svn-ultimate');

// const tpt_config_file = find_up.sync('_seed_template_config.json');
// const _template_config = jsonfile.readFileSync('../../_seed_template_config.json');
// console.log(tpt_config_file);
module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);

        const done = this.async();
        _get_config();

        function _get_config() {
            const url = 'https://github.com/saun4app/generator-component-based-webapp/raw/master/_config_dir/_seed_template_config.json';
            request(url, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var _template_config = JSON.parse(body);
                    console.log(_template_config);
                }
                done();
            })
        }
    }

    prompting() {

        let self = this;

        this.log(__dirname);

        this.prompt([{
                type: 'list',
                name: "template_name_key",
                message: "Select a seed template",
                choices: [{
                    name: 'pkerpedjiev/generator-gulp-webpack-es6',
                    value: ['pkerpedjiev/generator-gulp-webpack-es6']
                }]
            }])
            .then(function(answers) {
                self.log('template_name_key', answers.template_name_key);

                _prompt(answers.template_name_key);
            });

        function _prompt(template_name_key) {
            self.log('template_name_key');

            self.prompt([{
                type: 'input',
                name: 'name',
                message: 'Your project name',
                default: self.appname // Default to current folder name
            }, {
                type: 'confirm',
                name: 'cool',
                message: 'Would you like to enable the Cool feature?'
            }]).then((answers) => {
                self.log('app name', answers.name);
                self.log('cool feature', answers.cool);
            });
        }
    }
}
