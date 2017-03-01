'use strict';
const Generator = require('yeoman-generator');

const chalk = require('chalk');
const find_up = require('find-up');
const github_user = require('shelljs-github-user');
const jsonfile = require('jsonfile')
const request = require('request');
const snake_case = require('snake-case');
const yosay = require('yosay');
const shelljs = require('shelljs');
const svn_ultimate = require('node-svn-ultimate');

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);

        const self = this;
        this.helper_obj = new GeneratorHelper();
        this.helper_obj.read_template_config_obj(this)

        this.get_template_config_key_array = function() {
            return Object.keys(self.template_config_obj);
        };

        this.get_template_config_obj = function() {
            const name_key = self.template_name_key;
            return self.template_config_obj[name_key];
        };

        this.get_template_prompt_item_array = function() {
            const template_config_obj = self.get_template_config_obj();
            return template_config_obj['prompt_item_array'];
        };

        this.get_template_folder_url = function() {
            const template_config_obj = self.get_template_config_obj();
            return template_config_obj['svn_url'];
        };
    }

    initializing() {
        const self = this;
        /*
        const config_path = [this.sourceRoot(), '_template_config', '_webapp_template_config.json'].join('/');

        console.log(config_path);
        const config_json = this.fs.readJSON(config_path);
        console.log(config_json);
        const _request_completed = this.async();
        this.helper_obj.request_template_seed_config_obj(this, _request_completed);
        */
    }

    prompting() {
        const self = this;
        const _prompted_completed = this.async();

        this.log(yosay('Welcome to ' + chalk.red('generator-component-based-webapp ') + ' generator!'));

        github_user().then((github_user_info) => {
            self.gitInfo = github_user_info;
            _prompt_select_template();
        }).catch((reason) => {
            self.log(reason);
            _prompt_select_template(); // skip gitInfo
        });

        function _prompt_select_template() {
            const selected_template_name_key_array = self.helper_obj.prompt_for_template_name_key(self);

            self.prompt(selected_template_name_key_array).then(function(answer_obj) {
                self.template_name_key = answer_obj.template_name_key; // important
                self.helper_obj.export_template_folder(self);
                _prompt_project_info();
            });
        }

        function _prompt_project_info() {
            let prompt_item_array = self.helper_obj.get_prompt_item_array(self);
            self.log(prompt_item_array);
            self.prompt(prompt_item_array).then((props) => {
                self.log(props);

                self.props = props;
                _prompted_completed();
            });
        }
    }
}

class GeneratorHelper {
    prompt_for_template_name_key(caller_obj) {
        const template_name_key_array = caller_obj.get_template_config_key_array();

        const template_name_key_prompt = [{
            type: 'list',
            name: "template_name_key",
            message: "Select a seed template",
            choices: template_name_key_array
        }];

        return template_name_key_prompt;
    }

    get_prompt_item_array(caller_obj) {
        let prompt_item_array = caller_obj.get_template_prompt_item_array();

        const gitInfo = (caller_obj.gitInfo && caller_obj.gitInfo.name) ? caller_obj.gitInfo : false;
        if (gitInfo) {
            prompt_item_array.forEach((item) => {
                if (['author', 'email'].includes(item.name)) {
                    item.default = ('email' === item.name) ? gitInfo.email : gitInfo.name;
                }
                if (['name'].includes(item.name)) {
                    item.default = caller_obj.appname;
                }
            });
        }

        return prompt_item_array;
    }

    read_template_config_obj(caller_obj) {
        const config_path = [caller_obj.sourceRoot(), '_template_config', '_webapp_template_config.json'].join('/');
        caller_obj.template_config_obj = caller_obj.fs.readJSON(config_path);
    }

    export_template_folder(caller_obj) {
        const url = caller_obj.get_template_folder_url();

        const dest_path = [caller_obj.sourceRoot(), caller_obj.template_name_key].join('/');
        caller_obj.log(url);
        caller_obj.log(dest_path);

        svn_ultimate.commands.export(url, dest_path, function (err) {
            if (err) { console.error(err); }
        });
    }

}

/*
    request_template_seed_config_obj(caller_obj, done_function) {
        const url = 'https://github.com/saun4app/component-based-webapp-seed/raw/master/webapp_template/template_config/_webapp_template_config.json';

        request(url, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                caller_obj.template_seed_config_obj = JSON.parse(body);
            }
            done_function(error);
        });
    }
    */
