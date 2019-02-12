/*
 * Copyright 2016 resin.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const os = require('os');
const path = require('path');

module.exports = function(
  $http,
  WarningModalService,
  SettingsModel,
  OSDialogService,
  OSOpenExternalService,
  AppConfigService,
  SelectionStateModel
  ) {

  /**
   * mirror list
   */
  this.mirrors = {};

  /**
   * @summary Client platform
   * @type String
   * @constant
   * @public
   */
  this.platform = os.platform();

  /**
   * @summary Refresh current settings
   * @function
   * @public
   */
  this.refreshSettings = () => {
    this.currentData = SettingsModel.getAll();
    console.log('refresh:');
    console.log(this.currentData.downloadSource);
  };

  /**
   * @summary Current settings value
   * @type Object
   * @public
   */
  this.currentData = {};
  this.refreshSettings();

  /**
   * @summary Settings model
   * @type Object
   * @public
   */
  this.model = SettingsModel;

  /**
   * @summary Controller initialization
   * @function
   * @public
   */
  this.init = () => {
    this.getMirrors();
  };

  /**
   * @summary get mirror list
   * @function
   * @public
   */
  this.getMirrors = () => {
    $http.get(AppConfigService.MIRROR_LIST_PATH + '?d=' + new Date().getTime())
      .then((payload) => {
        this.mirrors = payload.data.mirrors;
      }).catch(this.handleFetchError);
  };

  /**
   * @summary get mirror name by server os
   * @function
   * @public
   * @param {String} server - download server url
   * @returns {String} mirror name
   */
  this.getMirrorName = (server) => {
    for (const key in this.mirrors) {
      if (this.mirrors[key].os === server) {
        return this.mirrors[key].name;
      }
    }
  };

  /**
   * @summary Enable a dangerous setting
   * @function
   * @public
   *
   * @param {String} name - setting name
   * @param {Object} options - options
   * @param {String} options.description - modal description
   * @param {String} options.confirmationLabel - modal confirmation label
   * @returns {Undefined}
   *
   * @example
   * SettingsController.enableDangerousSetting('unsafeMode', {
   *   description: 'Don\'t do this!',
   *   confirmationLabel: 'Do it!'
   * });
   */
  this.enableDangerousSetting = (name, options) => {
    if (!this.currentData[name]) {
      this.model.set(name, false);
      return this.refreshSettings();
    }

    // Keep the checkbox unchecked until the user confirms
    this.currentData[name] = false;

    WarningModalService.display(options).then((userAccepted) => {
      if (userAccepted) {
        this.model.set(name, true);
        this.refreshSettings();
      }
    });
  };

  this.selectDownloadLocation = () => {
    OSDialogService.selectFolder(this.currentData.downloadPath)
      .then((selectedFolder) => {
        if (!selectedFolder) {
          return;
        }

        this.model.set('downloadPath', selectedFolder);
        this.refreshSettings();
      });
  };

  this.selectDownloadLocation = () => {
    OSDialogService.selectFolder(this.currentData.downloadPath)
      .then((selectedFolder) => {
        if (!selectedFolder) {
          return;
        }

        this.model.set('downloadPath', selectedFolder);
        this.refreshSettings();
      });
  };

  this.showDownloadLocation = () => {
    if (this.currentData.downloadPath === '') {
      return;
    }

    let targetPath = path.resolve(this.currentData.downloadPath).replace(/\\/g, '/');

    if (targetPath[0] !== '/') {
      targetPath = '/' + targetPath;
    }

    OSOpenExternalService.open(encodeURI('file://' + targetPath));
  };

  this.selectDownloadSource = (source) => {
    if (this.currentData.downloadSource !== source) {
      this.model.set('downloadSource', source);

      this.refreshSettings();

      // upon changed download source, refresh App Configuration
      AppConfigService.refreshPaths(source);

      // clear last image selection
      SelectionStateModel.clear();
    }
  };

  this.getDownloadSource = () => {
    return this.model.get('downloadSource');
  };

  /**
   * @summary Prompt user on HTTP error and handle after error.
   * @function
   * @private
   *
   * @param {Object} error - $http error json
   *
   * @example
   * ImageSelectorController.resetSelectedOS();
   */
  this.handleFetchError = (error) => {
    OSDialogService.showError('Unable to fetch data from internet',
      'Please try again later. [HTTP status ' + error.status + ': ' + error.statusText + ']');
  };
};
