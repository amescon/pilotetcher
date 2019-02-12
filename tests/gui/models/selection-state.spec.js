'use strict';

const m = require('mochainon');
const _ = require('lodash');
const path = require('path');
const angular = require('angular');
require('angular-mocks');

describe('Browser: SelectionState', function() {

  beforeEach(angular.mock.module(
    require('../../../lib/gui/models/selection-state')
  ));

  beforeEach(angular.mock.module(
    require('../../../lib/gui/models/drives')
  ));

  describe('SelectionStateModel', function() {

    let SelectionStateModel;
    let DrivesModel;

    beforeEach(angular.mock.inject(function(_SelectionStateModel_, _DrivesModel_) {
      SelectionStateModel = _SelectionStateModel_;
      DrivesModel = _DrivesModel_;
    }));

    describe('given a clean state', function() {

      beforeEach(function() {
        SelectionStateModel.clear();
      });

      it('getDrive() should return undefined', function() {
        const drive = SelectionStateModel.getDrive();
        m.chai.expect(drive).to.be.undefined;
      });

      it('getImage() should return undefined', function() {
        m.chai.expect(SelectionStateModel.getImage()).to.be.undefined;
      });

      it('getImagePath() should return undefined', function() {
        m.chai.expect(SelectionStateModel.getImagePath()).to.be.undefined;
      });

      it('getImageSize() should return undefined', function() {
        m.chai.expect(SelectionStateModel.getImageSize()).to.be.undefined;
      });

      it('getImageUrl() should return undefined', function() {
        m.chai.expect(SelectionStateModel.getImageUrl()).to.be.undefined;
      });

      it('getImageName() should return undefined', function() {
        m.chai.expect(SelectionStateModel.getImageName()).to.be.undefined;
      });

      it('getImageLogo() should return undefined', function() {
        m.chai.expect(SelectionStateModel.getImageLogo()).to.be.undefined;
      });

      it('getImageSupportUrl() should return undefined', function() {
        m.chai.expect(SelectionStateModel.getImageSupportUrl()).to.be.undefined;
      });

      it('getImageRecommendedDriveSize() should return undefined', function() {
        m.chai.expect(SelectionStateModel.getImageRecommendedDriveSize()).to.be.undefined;
      });

      it('hasDrive() should return false', function() {
        const hasDrive = SelectionStateModel.hasDrive();
        m.chai.expect(hasDrive).to.be.false;
      });

      it('hasImage() should return false', function() {
        const hasImage = SelectionStateModel.hasImage();
        m.chai.expect(hasImage).to.be.false;
      });

      it('getOS should return undefined', function() {
        m.chai.expect(SelectionStateModel.getOS()).to.be.undefined;
      });

      it('getOSVersion should return undefined', function() {
        m.chai.expect(SelectionStateModel.getOSVersion()).to.be.undefined;
      });

      it('hasOS() should return false', function() {
        m.chai.expect(SelectionStateModel.hasOS()).to.be.false;
      });

    });

    describe('given a drive', function() {

      beforeEach(function() {
        DrivesModel.setDrives([
          {
            device: '/dev/disk2',
            name: 'USB Drive',
            size: 999999999,
            protected: false
          },
          {
            device: '/dev/disk5',
            name: 'USB Drive',
            size: 999999999,
            protected: false
          }
        ]);

        SelectionStateModel.setDrive('/dev/disk2');
      });

      describe('.getDrive()', function() {

        it('should return the drive', function() {
          const drive = SelectionStateModel.getDrive();
          m.chai.expect(drive).to.deep.equal({
            device: '/dev/disk2',
            name: 'USB Drive',
            size: 999999999,
            protected: false
          });
        });

      });

      describe('.hasDrive()', function() {

        it('should return true', function() {
          const hasDrive = SelectionStateModel.hasDrive();
          m.chai.expect(hasDrive).to.be.true;
        });

      });

      describe('.setDrive()', function() {

        it('should override the drive', function() {
          SelectionStateModel.setDrive('/dev/disk5');
          const drive = SelectionStateModel.getDrive();
          m.chai.expect(drive).to.deep.equal({
            device: '/dev/disk5',
            name: 'USB Drive',
            size: 999999999,
            protected: false
          });
        });

      });

      describe('.removeDrive()', function() {

        it('should clear the drive', function() {
          SelectionStateModel.removeDrive();
          const drive = SelectionStateModel.getDrive();
          m.chai.expect(drive).to.be.undefined;
        });

      });

    });

    describe('given no drive', function() {

      describe('.setDrive()', function() {

        it('should be able to set a drive', function() {
          DrivesModel.setDrives([
            {
              device: '/dev/disk5',
              name: 'USB Drive',
              size: 999999999,
              protected: false
            }
          ]);

          SelectionStateModel.setDrive('/dev/disk5');
          const drive = SelectionStateModel.getDrive();
          m.chai.expect(drive).to.deep.equal({
            device: '/dev/disk5',
            name: 'USB Drive',
            size: 999999999,
            protected: false
          });
        });

        it('should throw if drive is write protected', function() {
          DrivesModel.setDrives([
            {
              device: '/dev/disk1',
              name: 'USB Drive',
              size: 999999999,
              protected: true
            }
          ]);

          m.chai.expect(function() {
            SelectionStateModel.setDrive('/dev/disk1');
          }).to.throw('The drive is write-protected');
        });

        it('should throw if the drive is not available', function() {
          DrivesModel.setDrives([
            {
              device: '/dev/disk1',
              name: 'USB Drive',
              size: 999999999,
              protected: true
            }
          ]);

          m.chai.expect(function() {
            SelectionStateModel.setDrive('/dev/disk5');
          }).to.throw('The drive is not available: /dev/disk5');
        });

        it('should throw if device is not a string', function() {
          m.chai.expect(function() {
            SelectionStateModel.setDrive(123);
          }).to.throw('Invalid drive: 123');
        });

      });

    });

    describe('given an image', function() {

      beforeEach(function() {
        this.image = {
          path: 'foo.img',
          size: 999999999,
          recommendedDriveSize: 1000000000,
          url: 'https://www.raspbian.org',
          supportUrl: 'https://www.raspbian.org/forums/',
          name: 'Raspbian',
          logo: '<svg><text fill="red">Raspbian</text></svg>'
        };

        SelectionStateModel.setImage(this.image);
      });

      describe('.setDrive()', function() {

        it('should throw if drive is not large enough', function() {
          DrivesModel.setDrives([
            {
              device: '/dev/disk2',
              name: 'USB Drive',
              size: 999999998,
              protected: false
            }
          ]);

          m.chai.expect(function() {
            SelectionStateModel.setDrive('/dev/disk2');
          }).to.throw('The drive is not large enough');
        });

      });

      describe('.getImage()', function() {

        it('should return the image', function() {
          m.chai.expect(SelectionStateModel.getImage()).to.deep.equal(this.image);
        });

      });

      describe('.getImagePath()', function() {

        it('should return the image path', function() {
          const imagePath = SelectionStateModel.getImagePath();
          m.chai.expect(imagePath).to.equal('foo.img');
        });

      });

      describe('.getImageSize()', function() {

        it('should return the image size', function() {
          const imageSize = SelectionStateModel.getImageSize();
          m.chai.expect(imageSize).to.equal(999999999);
        });

      });

      describe('.getImageUrl()', function() {

        it('should return the image url', function() {
          const imageUrl = SelectionStateModel.getImageUrl();
          m.chai.expect(imageUrl).to.equal('https://www.raspbian.org');
        });

      });

      describe('.getImageName()', function() {

        it('should return the image name', function() {
          const imageName = SelectionStateModel.getImageName();
          m.chai.expect(imageName).to.equal('Raspbian');
        });

      });

      describe('.getImageLogo()', function() {

        it('should return the image logo', function() {
          const imageLogo = SelectionStateModel.getImageLogo();
          m.chai.expect(imageLogo).to.equal('<svg><text fill="red">Raspbian</text></svg>');
        });

      });

      describe('.getImageSupportUrl()', function() {

        it('should return the image support url', function() {
          const imageSupportUrl = SelectionStateModel.getImageSupportUrl();
          m.chai.expect(imageSupportUrl).to.equal('https://www.raspbian.org/forums/');
        });

      });

      describe('.getImageRecommendedDriveSize()', function() {

        it('should return the image recommended drive size', function() {
          const imageRecommendedDriveSize = SelectionStateModel.getImageRecommendedDriveSize();
          m.chai.expect(imageRecommendedDriveSize).to.equal(1000000000);
        });

      });

      describe('.hasImage()', function() {

        it('should return true', function() {
          const hasImage = SelectionStateModel.hasImage();
          m.chai.expect(hasImage).to.be.true;
        });

      });

      describe('.setImage()', function() {

        it('should override the image', function() {
          SelectionStateModel.setImage({
            path: 'bar.img',
            size: 999999999
          });

          const imagePath = SelectionStateModel.getImagePath();
          m.chai.expect(imagePath).to.equal('bar.img');
          const imageSize = SelectionStateModel.getImageSize();
          m.chai.expect(imageSize).to.equal(999999999);
        });

      });

      describe('.removeImage()', function() {

        it('should clear the image', function() {
          SelectionStateModel.removeImage();

          const imagePath = SelectionStateModel.getImagePath();
          m.chai.expect(imagePath).to.be.undefined;
          const imageSize = SelectionStateModel.getImageSize();
          m.chai.expect(imageSize).to.be.undefined;
        });

      });

    });

    describe('given no image', function() {

      describe('.setImage()', function() {

        it('should be able to set an image', function() {
          SelectionStateModel.setImage({
            path: 'foo.img',
            size: 999999999
          });

          const imagePath = SelectionStateModel.getImagePath();
          m.chai.expect(imagePath).to.equal('foo.img');
          const imageSize = SelectionStateModel.getImageSize();
          m.chai.expect(imageSize).to.equal(999999999);
        });

        it('should throw if no path', function() {
          m.chai.expect(function() {
            SelectionStateModel.setImage({
              size: 999999999
            });
          }).to.throw('Missing image path');
        });

        it('should throw if path is not a string', function() {
          m.chai.expect(function() {
            SelectionStateModel.setImage({
              path: 123,
              size: 999999999
            });
          }).to.throw('Invalid image path: 123');
        });

        it('should throw if no size', function() {
          m.chai.expect(function() {
            SelectionStateModel.setImage({
              path: 'foo.img'
            });
          }).to.throw('Missing image size');
        });

        it('should throw if size is not a number', function() {
          m.chai.expect(function() {
            SelectionStateModel.setImage({
              path: 'foo.img',
              size: '999999999'
            });
          }).to.throw('Invalid image size: 999999999');
        });

        it('should throw if url is defined but its not a string', function() {
          m.chai.expect(function() {
            SelectionStateModel.setImage({
              path: 'foo.img',
              size: 999999999,
              url: 1234
            });
          }).to.throw('Invalid image url: 1234');
        });

        it('should throw if name is defined but its not a string', function() {
          m.chai.expect(function() {
            SelectionStateModel.setImage({
              path: 'foo.img',
              size: 999999999,
              name: 1234
            });
          }).to.throw('Invalid image name: 1234');
        });

        it('should throw if logo is defined but its not a string', function() {
          m.chai.expect(function() {
            SelectionStateModel.setImage({
              path: 'foo.img',
              size: 999999999,
              logo: 1234
            });
          }).to.throw('Invalid image logo: 1234');
        });

        it('should de-select a previously selected not-large-enough drive', function() {
          DrivesModel.setDrives([
            {
              device: '/dev/disk1',
              name: 'USB Drive',
              size: 999999999,
              protected: false
            }
          ]);

          SelectionStateModel.setDrive('/dev/disk1');
          m.chai.expect(SelectionStateModel.hasDrive()).to.be.true;

          SelectionStateModel.setImage({
            path: 'foo.img',
            size: 9999999999
          });

          m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;
          SelectionStateModel.removeImage();
        });

        it('should de-select a previously selected not-recommended drive', function() {
          DrivesModel.setDrives([
            {
              device: '/dev/disk1',
              name: 'USB Drive',
              size: 1200000000,
              protected: false
            }
          ]);

          SelectionStateModel.setDrive('/dev/disk1');
          m.chai.expect(SelectionStateModel.hasDrive()).to.be.true;

          SelectionStateModel.setImage({
            path: 'foo.img',
            size: 999999999,
            recommendedDriveSize: 1500000000
          });

          m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;
          SelectionStateModel.removeImage();
        });

        it('should de-select a previously selected source drive', function() {
          const imagePath = _.attempt(() => {
            if (process.platform === 'win32') {
              return 'E:\\bar\\foo.img';
            }

            return '/mnt/bar/foo.img';
          });

          DrivesModel.setDrives([
            {
              device: '/dev/disk1',
              name: 'USB Drive',
              size: 1200000000,
              mountpoints: [
                {
                  path: path.dirname(imagePath)
                }
              ],
              protected: false
            }
          ]);

          SelectionStateModel.setDrive('/dev/disk1');
          m.chai.expect(SelectionStateModel.hasDrive()).to.be.true;

          SelectionStateModel.setImage({
            path: imagePath,
            size: 999999999
          });

          m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;
          SelectionStateModel.removeImage();
        });

      });

    });

    describe('given a drive', function() {

      beforeEach(function() {
        DrivesModel.setDrives([
          {
            device: '/dev/disk1',
            name: 'USB Drive',
            size: 999999999,
            protected: false
          }
        ]);

        SelectionStateModel.setDrive('/dev/disk1');

        SelectionStateModel.setImage({
          path: 'foo.img',
          size: 999999999
        });
      });

      describe('.clear()', function() {

        it('should clear all selections', function() {
          m.chai.expect(SelectionStateModel.hasDrive()).to.be.true;
          m.chai.expect(SelectionStateModel.hasImage()).to.be.true;

          SelectionStateModel.clear();

          m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;
          m.chai.expect(SelectionStateModel.hasImage()).to.be.false;
        });

      });

      describe('given the preserveImage option', function() {

        beforeEach(function() {
          SelectionStateModel.clear({
            preserveImage: true
          });
        });

        it('getDrive() should return undefined', function() {
          const drive = SelectionStateModel.getDrive();
          m.chai.expect(drive).to.be.undefined;
        });

        it('getImagePath() should return the image path', function() {
          const imagePath = SelectionStateModel.getImagePath();
          m.chai.expect(imagePath).to.equal('foo.img');
        });

        it('getImageSize() should return the image size', function() {
          const imageSize = SelectionStateModel.getImageSize();
          m.chai.expect(imageSize).to.equal(999999999);
        });

        it('hasDrive() should return false', function() {
          const hasDrive = SelectionStateModel.hasDrive();
          m.chai.expect(hasDrive).to.be.false;
        });

        it('hasImage() should return true', function() {
          const hasImage = SelectionStateModel.hasImage();
          m.chai.expect(hasImage).to.be.true;
        });

      });

    });

    describe('.isCurrentDrive()', function() {

      describe('given a selected drive', function() {

        beforeEach(function() {
          DrivesModel.setDrives([
            {
              device: '/dev/sdb',
              description: 'DataTraveler 2.0',
              size: 999999999,
              mountpoint: '/media/UNTITLED',
              name: '/dev/sdb',
              system: false,
              protected: false
            }
          ]);

          SelectionStateModel.setDrive('/dev/sdb');
        });

        it('should return false if an undefined value is passed', function() {
          m.chai.expect(SelectionStateModel.isCurrentDrive()).to.be.false;
        });

        it('should return true given the exact same drive', function() {
          m.chai.expect(SelectionStateModel.isCurrentDrive('/dev/sdb')).to.be.true;
        });

        it('should return false if it is not the current drive', function() {
          m.chai.expect(SelectionStateModel.isCurrentDrive('/dev/sdc')).to.be.false;
        });

      });

      describe('given no selected drive', function() {

        beforeEach(function() {
          SelectionStateModel.removeDrive();
        });

        it('should return false if an undefined value is passed', function() {
          m.chai.expect(SelectionStateModel.isCurrentDrive()).to.be.false;
        });

        it('should return false for anything', function() {
          m.chai.expect(SelectionStateModel.isCurrentDrive('/dev/sdb')).to.be.false;
        });

      });

    });

    describe('.toggleSetDrive()', function() {

      describe('given a selected drive', function() {

        beforeEach(function() {
          this.drive = {
            device: '/dev/sdb',
            description: 'DataTraveler 2.0',
            size: 999999999,
            mountpoint: '/media/UNTITLED',
            name: '/dev/sdb',
            system: false,
            protected: false
          };

          DrivesModel.setDrives([
            this.drive,
            {
              device: '/dev/disk2',
              name: 'USB Drive',
              size: 999999999,
              protected: false
            }
          ]);

          SelectionStateModel.setDrive(this.drive.device);
        });

        it('should be able to remove the drive', function() {
          m.chai.expect(SelectionStateModel.hasDrive()).to.be.true;
          SelectionStateModel.toggleSetDrive(this.drive.device);
          m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;
        });

        it('should be able to replace the drive', function() {
          const drive = {
            device: '/dev/disk2',
            name: 'USB Drive',
            size: 999999999,
            protected: false
          };

          m.chai.expect(SelectionStateModel.getDrive()).to.deep.equal(this.drive);
          SelectionStateModel.toggleSetDrive(drive.device);
          m.chai.expect(SelectionStateModel.getDrive()).to.deep.equal(drive);
          m.chai.expect(SelectionStateModel.getDrive()).to.not.deep.equal(this.drive);
        });

      });

      describe('given no selected drive', function() {

        beforeEach(function() {
          SelectionStateModel.removeDrive();
        });

        it('should set the drive', function() {
          const drive = {
            device: '/dev/disk2',
            name: 'USB Drive',
            size: 999999999,
            protected: false
          };

          m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;
          SelectionStateModel.toggleSetDrive(drive.device);
          m.chai.expect(SelectionStateModel.getDrive()).to.deep.equal(drive);
        });

      });

    });

    describe('given an OS', function() {

      beforeEach(function() {
        SelectionStateModel.setOS({
          name: 'Custom Operation System',
          version: '1.0.0',
          images: [
            {
              checksum: 'e5b4ee5f5acf2613b197fe1edf29a80c',
              checksumType: 'md5',
              recommendedDriveSize: 4000000000,
              url: 'http://path.to/os/os.4gb.tar.gz'
            },
            {
              checksum: '7b59f5efdb1bc2a9ea7f92adf3a91477',
              checksumType: 'md5',
              recommendedDriveSize: 2000000000,
              url: 'http://path.to/os/os.2gb.tar.gz'
            },
            {
              checksum: 'efc88c38dbba1ae202416c3330916549',
              checksumType: 'md5',
              recommendedDriveSize: 6000000000,
              url: 'http://path.to/os/os.6gb.tar.gz'
            },
            {
              checksum: 'aedba18eec9921a8fa4bee8bbf199b2b',
              checksumType: 'md5',
              recommendedDriveSize: 8000000000,
              url: 'http://path.to/os/os.8gb.tar.gz'
            }
          ],
          logo: 'http://path.to/image/logo'
        });
      });

      describe('.hasOS()', function() {
        it('should return true', function() {
          m.chai.expect(SelectionStateModel.hasOS()).to.be.true;
        });
      });

      describe('.getOS()', function() {
        it('should return the selected OS', function() {
          m.chai.expect(SelectionStateModel.getOS()).to.be.deep.equal({
            name: 'Custom Operation System',
            version: '1.0.0',
            images: [
              {
                checksum: 'e5b4ee5f5acf2613b197fe1edf29a80c',
                checksumType: 'md5',
                recommendedDriveSize: 4000000000,
                url: 'http://path.to/os/os.4gb.tar.gz'
              },
              {
                checksum: '7b59f5efdb1bc2a9ea7f92adf3a91477',
                checksumType: 'md5',
                recommendedDriveSize: 2000000000,
                url: 'http://path.to/os/os.2gb.tar.gz'
              },
              {
                checksum: 'efc88c38dbba1ae202416c3330916549',
                checksumType: 'md5',
                recommendedDriveSize: 6000000000,
                url: 'http://path.to/os/os.6gb.tar.gz'
              },
              {
                checksum: 'aedba18eec9921a8fa4bee8bbf199b2b',
                checksumType: 'md5',
                recommendedDriveSize: 8000000000,
                url: 'http://path.to/os/os.8gb.tar.gz'
              }
            ],
            logo: 'http://path.to/image/logo'
          });
        });
      });

      describe('.getOSVersion()', function() {
        it('should return current selected OS version', function() {
          m.chai.expect(SelectionStateModel.getOSVersion()).to.be.equal('1.0.0');
        });
      });

      describe('.getImageName()', function() {
        it('should return current selected OS name', function() {
          m.chai.expect(SelectionStateModel.getImageName()).to.be.equal('Custom Operation System');
        });
      });

      describe('.getImageLogo()', function() {
        it('should return current selected OS logo path', function() {
          m.chai.expect(SelectionStateModel.getImageLogo()).to.be.equal('http://path.to/image/logo');
        });
      });

      describe('.removeOS()', function() {
        it('should remove current selected OS', function() {
          SelectionStateModel.removeOS();

          m.chai.expect(SelectionStateModel.hasOS()).to.be.false;
          m.chai.expect(SelectionStateModel.getOS()).to.be.undefined;
        });
      });

      describe('.getOSSmallestImage()', function() {
        it('should return the smallest image', function() {
          m.chai.expect(SelectionStateModel.getOSSmallestImage()).to.be.deep.equal({
            checksum: '7b59f5efdb1bc2a9ea7f92adf3a91477',
            checksumType: 'md5',
            recommendedDriveSize: 2000000000,
            url: 'http://path.to/os/os.2gb.tar.gz'
          });
        });
      });

      describe('.getOSMinimumSize()', function() {

        it('should return the smallest size of the image', function() {
          m.chai.expect(SelectionStateModel.getOSMinimumSize()).to.be.equal(2000000000);
        });
      });

      describe('given a drive', function() {
        beforeEach(function() {
          DrivesModel.setDrives([
            {
              device: '/dev/disk1',
              name: 'USB Drive',
              size: 4000000000,
              protected: false
            }
          ]);

          SelectionStateModel.setDrive('/dev/disk1');
        });

        describe('.clear()', function() {

          it('should clear all selections', function() {
            m.chai.expect(SelectionStateModel.hasDrive()).to.be.true;
            m.chai.expect(SelectionStateModel.hasOS()).to.be.true;

            SelectionStateModel.clear();

            m.chai.expect(SelectionStateModel.hasDrive()).to.be.false;
            m.chai.expect(SelectionStateModel.hasOS()).to.be.false;
          });

        });

        describe('given the preserveImage option', function() {

          beforeEach(function() {
            SelectionStateModel.clear({
              preserveImage: true
            });
          });

          it('getDrive() should return undefined', function() {
            const drive = SelectionStateModel.getDrive();
            m.chai.expect(drive).to.be.undefined;
          });

          it('getOS() should return previous selected OS', function() {
            m.chai.expect(SelectionStateModel.getOS()).to.be.deep.equal({
              name: 'Custom Operation System',
              version: '1.0.0',
              images: [
                {
                  checksum: 'e5b4ee5f5acf2613b197fe1edf29a80c',
                  checksumType: 'md5',
                  recommendedDriveSize: 4000000000,
                  url: 'http://path.to/os/os.4gb.tar.gz'
                },
                {
                  checksum: '7b59f5efdb1bc2a9ea7f92adf3a91477',
                  checksumType: 'md5',
                  recommendedDriveSize: 2000000000,
                  url: 'http://path.to/os/os.2gb.tar.gz'
                },
                {
                  checksum: 'efc88c38dbba1ae202416c3330916549',
                  checksumType: 'md5',
                  recommendedDriveSize: 6000000000,
                  url: 'http://path.to/os/os.6gb.tar.gz'
                },
                {
                  checksum: 'aedba18eec9921a8fa4bee8bbf199b2b',
                  checksumType: 'md5',
                  recommendedDriveSize: 8000000000,
                  url: 'http://path.to/os/os.8gb.tar.gz'
                }
              ],
              logo: 'http://path.to/image/logo'
            });
          });

          it('hasDrive() should return false', function() {
            const hasDrive = SelectionStateModel.hasDrive();
            m.chai.expect(hasDrive).to.be.false;
          });

          it('hasOS() should return true', function() {
            m.chai.expect(SelectionStateModel.hasOS()).to.be.true;
          });

        });

      });

      describe('given 2 drives and /dev/disk1 as selected drive', function() {
        beforeEach(function() {
          DrivesModel.setDrives([
            {
              device: '/dev/disk1',
              name: 'USB Drive',
              size: 4000000000,
              protected: false
            },
            {
              device: '/dev/disk2',
              name: 'USB Drive 2',
              size: 8000000000,
              protected: false
            }
          ]);

          SelectionStateModel.setDrive('/dev/disk1');
        });

        it('should able to map each drive with correct image', function() {
          m.chai.expect(DrivesModel.getDrives()[0].recommendedImage).to.be.deep.equal({
            checksum: 'e5b4ee5f5acf2613b197fe1edf29a80c',
            checksumType: 'md5',
            recommendedDriveSize: 4000000000,
            url: 'http://path.to/os/os.4gb.tar.gz'
          });
          m.chai.expect(DrivesModel.getDrives()[1].recommendedImage).to.be.deep.equal({
            checksum: 'aedba18eec9921a8fa4bee8bbf199b2b',
            checksumType: 'md5',
            recommendedDriveSize: 8000000000,
            url: 'http://path.to/os/os.8gb.tar.gz'
          });
        });

        it('should able to map correct image to selection image', function() {
          m.chai.expect(SelectionStateModel.getImage()).to.be.deep.equal({
            path: 'http://path.to/os/os.4gb.tar.gz',
            size: 4000000000,
            logo: 'http://path.to/image/logo',
            version: '1.0.0',
            downloadChecksum: 'e5b4ee5f5acf2613b197fe1edf29a80c',
            downloadChecksumType: 'md5'
          });
        });

        it('should able to map correct image when select another drive (/dev/disk2)', function() {
          m.chai.expect(SelectionStateModel.getImage().downloadChecksum).to.be.equal('e5b4ee5f5acf2613b197fe1edf29a80c');

          SelectionStateModel.setDrive('/dev/disk2');

          m.chai.expect(SelectionStateModel.getImage()).to.be.deep.equal({
            path: 'http://path.to/os/os.8gb.tar.gz',
            size: 8000000000,
            logo: 'http://path.to/image/logo',
            version: '1.0.0',
            downloadChecksum: 'aedba18eec9921a8fa4bee8bbf199b2b',
            downloadChecksumType: 'md5'
          });
        });

        it('should able to map correct image while selected drive has being removed', function() {
          DrivesModel.setDrives([
            {
              device: '/dev/disk2',
              name: 'USB Drive 2',
              size: 8000000000,
              protected: false
            }
          ]);

          m.chai.expect(SelectionStateModel.getDrive()).to.be.deep.equal({
            device: '/dev/disk2',
            name: 'USB Drive 2',
            size: 8000000000,
            protected: false,
            recommendedImage: {
              checksum: 'aedba18eec9921a8fa4bee8bbf199b2b',
              checksumType: 'md5',
              recommendedDriveSize: 8000000000,
              url: 'http://path.to/os/os.8gb.tar.gz'
            }
          });

          m.chai.expect(SelectionStateModel.getImage()).to.be.deep.equal({
            path: 'http://path.to/os/os.8gb.tar.gz',
            size: 8000000000,
            logo: 'http://path.to/image/logo',
            version: '1.0.0',
            downloadChecksum: 'aedba18eec9921a8fa4bee8bbf199b2b',
            downloadChecksumType: 'md5'
          });
        });
      });

    });

  });

});