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

const m = require('mochainon');
const fs = require('fs');
const path = require('path');
const image = require('../../lib/cli/image');
const DATA_PATH = path.join(__dirname, 'data');
const FILES_PATH = path.join(DATA_PATH, 'files');

describe('CLI: Image', function() {

  describe('.getImageFileSize()', function() {

    it('should return correct file size', function(done) {
      const imagePath = path.join(FILES_PATH, 'raspberrypi.img');
      const expectedSize = fs.statSync(imagePath).size;

      image.getImageFileSize(imagePath).then((fileSize) => {
        m.chai.expect(fileSize).to.equal(expectedSize);
        done();
      });
    });

    it('should throw error when given invalid file path', function(done) {
      const invalidImagePath = path.join(FILES_PATH, 'invalid_path.img');

      image.getImageFileSize(invalidImagePath).catch(() => {
        done();
      });
    });

  });

  describe('.ensureLocalImage()', function() {

    it('should throw error if downloadLocation is not specified for network resource', function(done) {
      const networkResource = 'http://www.somedomain.net/file.img';

      image.ensureLocalImage(networkResource)
        .catch(() => {
          done();
        });
    });

  });

});
