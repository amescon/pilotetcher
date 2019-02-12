/*
 * Copyright 2017 Pine64
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

const _ = require('lodash');
const url = require('url');
const filenamify = require('filenamify');

const PROGRESS_SMOOTHING_FACTOR = 0.005;

// Do not change this value, it must be 1000.
const PROGRESS_UPDATE_INTERVAL = 1000;

/**
 * @summary Check is given string downloadable content.
 * @function
 *
 * @param {String} str - any string
 *
 * @returns {Boolean}
 */
exports.isNetworkResource = (str) => {
  return _.startsWith(str, 'http');
};

/**
 * @summary Extract image name from URL
 * @function
 *
 * @param {String} urlString - URL
 *
 * @returns {String}
 */
exports.extractNameFromURL = (urlString) => {
  const name = filenamify(_.last(_.split(url.parse(urlString).pathname, '/')));
  if (_.isEmpty(name)) {
    throw new Error('no valid file name in url');
  }
  return name;
};

/**
 * @summary Extract host name from URL
 * @function
 *
 * @param {String} urlString - URL
 *
 * @returns {String}
 */
exports.extractHostnameFromURL = (urlString) => {
  const symbolIndex = urlString.indexOf('://');
  if (symbolIndex > -1) {
    urlString = urlString.substring(symbolIndex + 3);
  }
  let hostname = _.first(_.compact(urlString.split('/')));
  hostname = _.first(_.compact(hostname.split(':')));
  hostname = filenamify(hostname);

  if (_.isEmpty(hostname)) {
    throw new Error('no valid host name in url');
  }

  return hostname;
};

/** Class representing a progress. */
exports.Progress = class {
  /**
   * Create a point.
   * @param {Function} onProgress - on progress callback (percentage, eta, speed)
   * @param {Number} [totalSize=0] - total size.
   * @param {Number} [initialUpdateDelay=2000] - initial update delay in milliseconds
   */
  constructor(onProgress, totalSize = 0, initialUpdateDelay = 2000) {
    this.onProgress = onProgress;
    this.totalSize = totalSize;
    this.initialUpdateDelay = initialUpdateDelay;

    this.updatedSize = 0;
    this.lastUpdatedSize = 0;

    this.isUpdateStarted = false;
    this.isCompleted = false;

    this.averageSpeed = 0;
  }

  /**
   * Update total size, must be called before update.
   * @param {Number} size - total size
   */
  setTotalSize(size) {
    if (this.isUpdateStarted) {
      throw new Error('too late to set total size');
    }
    this.totalSize = size;
  }

  /**
   * Update total size, must be called before update.
   * @param {Number} size - total size
   */
  setStartSize(size) {
    if (this.isUpdateStarted) {
      throw new Error('too late to set start size');
    }
    this.updatedSize = size;
    this.lastUpdatedSize = size;
  }

  /**
   * Start update progress.
   */
  startUpdate() {
    if (this.isUpdateStarted) {
      throw new Error('progress already started');
    }
    this.isUpdateStarted = true;

    // initialize progress with unknown etimated time
    this.onProgress(this.percentage, -1, -1);

    // gives a few seconds so that average speed is more accurate
    setTimeout(() => {
      const intervalInSecond = this.initialUpdateDelay / 1000;
      this.averageSpeed = (this.updatedSize - this.lastUpdatedSize) / intervalInSecond;
      this.lastUpdatedSize = this.updatedSize - this.averageSpeed;
      this.updateProgressInfo();
    }, this.initialUpdateDelay);
  }

  /**
   * Update progress bar to new size.
   * @param {Number} size - size received / progressed / ...
   */
  update(size) {
    this.updatedSize += size;
  }

  /**
   * Update progress bar info, must be called every 1 second.
   * http://stackoverflow.com/a/3841706
   */
  updateProgressInfo() {
    const pendingSize = this.totalSize - this.updatedSize;
    const lastSpeed = this.updatedSize - this.lastUpdatedSize;
    this.lastUpdatedSize = this.updatedSize;
    let eta = -1;

    if (lastSpeed > 0) {
      const current = PROGRESS_SMOOTHING_FACTOR * lastSpeed;
      const average = (1 - PROGRESS_SMOOTHING_FACTOR) * this.averageSpeed;
      this.averageSpeed = current + average;
    }

    if (this.averageSpeed > 0 && pendingSize >= 0) {
      eta = _.floor(pendingSize / this.averageSpeed);

      // make sure eta is not lower than 1 seconds, only `complete` can have eta of 0.
      const MIN_ETA = 1;
      eta = eta < MIN_ETA ? MIN_ETA : eta;
    }

    if (!this.isCompleted) {
      this.onProgress(this.percentage, eta, lastSpeed);

      setTimeout(() => {
        this.updateProgressInfo();
      }, PROGRESS_UPDATE_INTERVAL);
    }
  }

  /**
   * Get current progress in percentage.
   * @returns {Number} percentage
   */
  get percentage() {
    // unable to calculate if total size is <= 0, UI will display as 0% in this case.
    if (this.totalSize <= 0) {
      const AMBIGUOUS_PERCENTAGE = 0;
      return AMBIGUOUS_PERCENTAGE;
    }

    // 100% only appear when progress status is "Completed".
    const MIN_PERCENTAGE = 0;
    const MAX_PERCENTAGE = 99;
    const percentage = _.round(this.updatedSize / this.totalSize * 100);
    return _.clamp(percentage, MIN_PERCENTAGE, MAX_PERCENTAGE);
  }

  /**
   * Abort this progress.
   */
  abort() {
    this.isUpdateStarted = true;
    this.isCompleted = true;
    this.onProgress(this.percentage, -1, -1);
  }

  /**
   * Complete this progress.
   */
  complete() {
    this.isUpdateStarted = true;
    this.isCompleted = true;
    this.onProgress(100, 0, 0);
  }
};
