'use babel';

import { CompositeDisposable, NotificationManager } from 'atom';
import * as https from 'https';
import {Updater} from './updater';
import {Timer} from './timer';

export default {

  config: {
    acceptTestVersion: {
      'type': 'boolean',
      'default': false,
      'title': 'Accept test versions of atom.',
      'description': 'You can accept test versions of atom.'
    },
    checkInterval: {
      'type': 'integer',
      'default': 1,
      'title': 'Check interval',
      'description': 'Interval to check new versions of atom in repository, in hours.'
    },
    pkgType: {
      'type': 'string',
      'default': 'deb',
      'title': 'Package type',
      'enum': [
        {'value': 'deb', 'description': 'Debian, Ubuntu'},
        {'value': 'rpm', 'description': 'RedHat'},
        {'value': 'nupkg', 'description': 'Mac OSX'},
      ],
      'description': 'The type of package for download.'
    }
  },

  updaterNotifyView: null,
  modalPanel: null,
  subscriptions: null,
  timer: null,

  checkInterval() {
    return 1000 * (atom.config.get('updater-notify.checkInterval') * 60 * 60);
  },

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'updater-notify:toggle': () => this.manualCheck(),
      'updater-notify:manualCheck': () => this.manualCheck()
    }));

    if(!this.timer) {
      var me = this;

      this.timer = new Timer(
        () => {
          this.automaticChecker();
        },
        false,
        false,
        this.checkInterval()
      );
    }

    this.timer.start();
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();

    this.timer.stop();
  },

  serialize() {
    return {
    };
  },

  automaticChecker() {
    up.checkUpdate().then(
      (info) => {
        if(info) {
          atom.notifications.addInfo(
            [
              '<p>Existe uma atualização do atom.</p>',
              '<p>Versão disponivel: <a href="' + info.html_url + '">' + info.name + '</a></p>'
            ].join('')
          );
        }
      },
      (message) => {
        atom.notifications.addError(message);
      }
    );
  },

  manualCheck() {
    let up = new Updater();

    up.checkUpdate().then(
      (info) => {
        if(info) {
          atom.notifications.addInfo(
            [
              '<p>Existe uma atualização do atom.</p>',
              '<p>Versão disponivel: <a href="' + info.html_url + '">' + info.name + '</a></p>'
            ].join('')
          );
        }
        else
          atom.notifications.addInfo('Nenhuma atualização disponivel até o momento.');
      },
      (message) => {
        atom.notifications.addError(message);
      }
    );
  }

};