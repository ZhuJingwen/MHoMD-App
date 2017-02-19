// (c) 2014 Don Coleman
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* global mainPage, deviceList, refreshButton */
/* global detailPage, resultDiv, messageInput, sendButton, disconnectButton */
/* global ble  */
/* jshint browser: true , devel: true*/
'use strict';

// ASCII only
function bytesToString(buffer) {
  return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

// ASCII only
function stringToBytes(string) {
  var array = new Uint8Array(string.length);
  for (var i = 0, l = string.length; i < l; i++) {
    array[i] = string.charCodeAt(i);
  }
  return array.buffer;
}

// this is Nordic's UART service
var bluefruit = {
  serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
  rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e' // receive is from the phone's perspective
};

var deviceId;

var shiftData = new Array(32);
for (var i = 0; i < shiftData.length; i++) {
  shiftData[i] = false;
}

var app = {
  initialize: function() {
    this.bindEvents();
    // detailPage.hidden = true;
    $('#detailPage').hide();
    $('.patternOn').hide();
  },
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
    refreshButton.addEventListener('touchstart', this.refreshDeviceList, false);
    disconnectButton.addEventListener('touchstart', this.disconnect, false);
    deviceList.addEventListener('touchstart', this.connect, false); // assume not scrolling
    patternOff0.addEventListener('touchstart', this.turn0, false);
    patternOff1.addEventListener('touchstart', this.turn1, false);
    patternOff2.addEventListener('touchstart', this.turn2, false);
    patternOff5.addEventListener('touchstart', this.turn5, false);
    patternOff10.addEventListener('touchstart', this.turn10, false);
    patternOff11.addEventListener('touchstart', this.turn11, false);
    patternOff14.addEventListener('touchstart', this.turn14, false);
    patternOff15.addEventListener('touchstart', this.turn15, false);
    patternOff18.addEventListener('touchstart', this.turn18, false);
    patternOff20.addEventListener('touchstart', this.turn20, false);
    patternOff22.addEventListener('touchstart', this.turn22, false);
    patternOff23.addEventListener('touchstart', this.turn23, false);
    patternOff27.addEventListener('touchstart', this.turn27, false);
    patternOff28.addEventListener('touchstart', this.turn28, false);
    patternOff30.addEventListener('touchstart', this.turn30, false);
    patternOff31.addEventListener('touchstart', this.turn31, false);

    patternOn0.addEventListener('touchstart', this.turn0, false);
    patternOn1.addEventListener('touchstart', this.turn1, false);
    patternOn2.addEventListener('touchstart', this.turn2, false);
    patternOn5.addEventListener('touchstart', this.turn5, false);
    patternOn10.addEventListener('touchstart', this.turn10, false);
    patternOn11.addEventListener('touchstart', this.turn11, false);
    patternOn14.addEventListener('touchstart', this.turn14, false);
    patternOn15.addEventListener('touchstart', this.turn15, false);
    patternOn18.addEventListener('touchstart', this.turn18, false);
    patternOn20.addEventListener('touchstart', this.turn20, false);
    patternOn22.addEventListener('touchstart', this.turn22, false);
    patternOn23.addEventListener('touchstart', this.turn23, false);
    patternOn27.addEventListener('touchstart', this.turn27, false);
    patternOn28.addEventListener('touchstart', this.turn28, false);
    patternOn30.addEventListener('touchstart', this.turn30, false);
    patternOn31.addEventListener('touchstart', this.turn31, false);

  },
  onDeviceReady: function() {
    app.refreshDeviceList();
  },
  refreshDeviceList: function() {
    deviceList.innerHTML = ''; // empties the list
    if (cordova.platformId === 'android') { // Android filtering is broken
      ble.scan([], 5, app.onDiscoverDevice, app.onError);
    } else {
      ble.scan([bluefruit.serviceUUID], 5, app.onDiscoverDevice, app.onError);
    }
  },
  onDiscoverDevice: function(device) {
    var listItem = document.createElement('li'),
      html = '<b>' + device.name + '</b><br/>' +
      'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
      device.id;

    listItem.dataset.deviceId = device.id;
    listItem.innerHTML = html;
    deviceList.appendChild(listItem);
  },
  connect: function(e) {
    deviceId = e.target.dataset.deviceId;
    var onConnect = function(peripheral) {
      // subscribe for incoming data
      ble.startNotification(deviceId, bluefruit.serviceUUID, bluefruit.rxCharacteristic, app.onData, app.onError);
      app.fadeInDetailPage();

    };

    ble.connect(deviceId, onConnect, app.onError);
  },
  onData: function(data) { // data received from Arduino
    // console.log(data);
    // resultDiv.innerHTML = resultDiv.innerHTML + "Received: " + bytesToString(data) + "<br/>";
    // resultDiv.scrollTop = resultDiv.scrollHeight;
  },
  sendData: function() { // send data to Arduino

    var success = function() {
      console.log("success");
      // resultDiv.innerHTML = resultDiv.innerHTML + "Sent: " + messageInput.value + "<br/>";
      // resultDiv.scrollTop = resultDiv.scrollHeight;
    };

    var failure = function() {
      alert("Failed writing data to the bluefruit le");
    };

    var pattern = "50";
    var data = stringToBytes(pattern);
    ble.write(
      deviceId,
      bluefruit.serviceUUID,
      bluefruit.txCharacteristic,
      data, success, failure
    );

  },
  disconnect: function() {
    var success = function() {
      var shiftData = new Array(32);
      for (var i = 0; i < shiftData.length; i++) {
        shiftData[i] = false;
      }

      ble.disconnect(deviceId, app.fadeInMainPage, app.onError);
    };

    var failure = function() {
      alert("Failed writing data to the bluefruit le");
    };
    var pattern = "50";
    var data = stringToBytes(pattern);
    ble.write(
      deviceId,
      bluefruit.serviceUUID,
      bluefruit.txCharacteristic,
      data, success, failure
    );
  },
  fadeInMainPage: function() {
    $('.patternOn').hide();
    $('.patternOff').show();
    $('#detailPage').fadeOut();
    $('#mainPage').fadeIn();

  },
  fadeInDetailPage: function() {
    // mainPage.hidden = true;
    // detailPage.hidden = false;
    $('#mainPage').fadeOut();
    $('#detailPage').fadeIn();

  },
  turn0: function() {
    var success = function() {
      if (shiftData[0] == false) {
        shiftData[0] = true;
        $('#patternOff0').fadeOut();
        $('#patternOn0').fadeIn();
      } else {
        shiftData[0] = false;
        $('#patternOn0').fadeOut();
        $('#patternOff0').fadeIn();
      }
    };
    var failure = function() {
      alert("Failed writing data to the bluefruit le");
    };
    var data = stringToBytes("0");
    ble.write(
      deviceId,
      bluefruit.serviceUUID,
      bluefruit.txCharacteristic,
      data, success, failure
    );
  },
  turn1: function() {
    var success = function() {
      if (shiftData[1] == false) {
        shiftData[1] = true;
        $('#patternOff1').fadeOut();
        $('#patternOn1').fadeIn();
      } else {
        shiftData[1] = false;
        $('#patternOn1').fadeOut();
        $('#patternOff1').fadeIn();
      }
    };
    var failure = function() {
      alert("Failed writing data to the bluefruit le");
    };
    var data = stringToBytes("1");
    ble.write(
      deviceId,
      bluefruit.serviceUUID,
      bluefruit.txCharacteristic,
      data, success, failure
    );
  },
  turn2: function() {
    var success = function() {
      if (shiftData[2] == false) {
        shiftData[2] = true;
        $('#patternOff2').fadeOut();
        $('#patternOn2').fadeIn();
      } else {
        shiftData[2] = false;
        $('#patternOn2').fadeOut();
        $('#patternOff2').fadeIn();
      }
    };
    var success1 = function() {
      console.log("success1");
      setTimeout(function() {
        var data1 = stringToBytes("3");
        ble.write(deviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic,
          data1, success2, failure
        );
      }, 80);
    };
    var success2 = function() {
      console.log("success2");
      setTimeout(function() {
        var data2 = stringToBytes("4");
        ble.write(
          deviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic,
          data2, success, failure
        );

      }, 80);
    };
    var failure = function() {
      alert("Failed writing data to the bluefruit le");
    };
    var data = stringToBytes("2");
    ble.write(
      deviceId,
      bluefruit.serviceUUID,
      bluefruit.txCharacteristic,
      data, success1, failure
    );
  },
  turn5: function() {
    var success = function() {
      if (shiftData[5] == false) {
        shiftData[5] = true;
        $('#patternOff5').fadeOut();
        $('#patternOn5').fadeIn();
      } else {
        shiftData[5] = false;
        $('#patternOn5').fadeOut();
        $('#patternOff5').fadeIn();
      }
    };
    var failure = function() {
      alert("Failed writing data to the bluefruit le");
    };
    var data = stringToBytes("5");
    ble.write(
      deviceId,
      bluefruit.serviceUUID,
      bluefruit.txCharacteristic,
      data, success, failure
    );
  },
  turn10: function() {
    var success = function() {
      if (shiftData[10] == false) {
        shiftData[10] = true;
        $('#patternOff10').fadeOut();
        $('#patternOn10').fadeIn();
      } else {
        shiftData[10] = false;
        $('#patternOn10').fadeOut();
        $('#patternOff10').fadeIn();
      }
    };
    var failure = function() {
      alert("Failed writing data to the bluefruit le");
    };
    var data = stringToBytes("10");
    ble.write(
      deviceId,
      bluefruit.serviceUUID,
      bluefruit.txCharacteristic,
      data, success, failure
    );
  },
  turn11: function() {
    var success = function() {
      if (shiftData[11] == false) {
        shiftData[11] = true;
        $('#patternOff11').fadeOut();
        $('#patternOn11').fadeIn();
      } else {
        shiftData[11] = false;
        $('#patternOn11').fadeOut();
        $('#patternOff11').fadeIn();
      }
    };
    var success1 = function() {
      console.log("success1");
      setTimeout(function() {
        var data1 = stringToBytes("12");
        ble.write(deviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic,
          data1, success2, failure
        );
      }, 80);
    };
    var success2 = function() {
      console.log("success2");
      setTimeout(function() {
        var data2 = stringToBytes("13");
        ble.write(
          deviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic,
          data2, success, failure
        );

      }, 80);
    };
    var failure = function() {
      alert("Failed writing data to the bluefruit le");
    };
    var data = stringToBytes("11");
    ble.write(
      deviceId,
      bluefruit.serviceUUID,
      bluefruit.txCharacteristic,
      data, success1, failure
    );
  },
  turn14: function() {
    var success = function() {
      if (shiftData[14] == false) {
        shiftData[14] = true;
        $('#patternOff14').fadeOut();
        $('#patternOn14').fadeIn();
      } else {
        shiftData[14] = false;
        $('#patternOn14').fadeOut();
        $('#patternOff14').fadeIn();
      }
    };
    var failure = function() {
      alert("Failed writing data to the bluefruit le");
    };
    var data = stringToBytes("14");
    ble.write(
      deviceId,
      bluefruit.serviceUUID,
      bluefruit.txCharacteristic,
      data, success, failure
    );
  },
  turn15: function() {
    var success = function() {
      if (shiftData[15] == false) {
        shiftData[15] = true;
        $('#patternOff15').fadeOut();
        $('#patternOn15').fadeIn();
      } else {
        shiftData[15] = false;
        $('#patternOn15').fadeOut();
        $('#patternOff15').fadeIn();
      }
    };
    var failure = function() {
      alert("Failed writing data to the bluefruit le");
    };
    var data = stringToBytes("15");
    ble.write(
      deviceId,
      bluefruit.serviceUUID,
      bluefruit.txCharacteristic,
      data, success, failure
    );
  },
  turn18: function() {
    var success = function() {
      if (shiftData[18] == false) {
        shiftData[18] = true;
        $('#patternOff18').fadeOut();
        $('#patternOn18').fadeIn();
      } else {
        shiftData[18] = false;
        $('#patternOn18').fadeOut();
        $('#patternOff18').fadeIn();
      }
    };
    var success1 = function() {
      console.log("success1");
      setTimeout(function() {
        var data1 = stringToBytes("19");
        ble.write(deviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic,
          data1, success, failure
        );
      }, 80);
    };
    var failure = function() {
      alert("Failed writing data to the bluefruit le");
    };
    var data = stringToBytes("18");
    ble.write(
      deviceId,
      bluefruit.serviceUUID,
      bluefruit.txCharacteristic,
      data, success1, failure
    );
  },
  turn20: function() {
    var success = function() {
      if (shiftData[20] == false) {
        shiftData[20] = true;
        $('#patternOff20').fadeOut();
        $('#patternOn20').fadeIn();
      } else {
        shiftData[20] = false;
        $('#patternOn20').fadeOut();
        $('#patternOff20').fadeIn();
      }
    };
    var success1 = function() {
      console.log("success1");
      setTimeout(function() {
        var data1 = stringToBytes("21");
        ble.write(deviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic,
          data1, success, failure
        );
      }, 80);
    };
    var failure = function() {
      alert("Failed writing data to the bluefruit le");
    };
    var data = stringToBytes("20");
    ble.write(
      deviceId,
      bluefruit.serviceUUID,
      bluefruit.txCharacteristic,
      data, success1, failure
    );
  },
  turn22: function() {
    var success = function() {
      if (shiftData[22] == false) {
        shiftData[22] = true;
        $('#patternOff22').fadeOut();
        $('#patternOn22').fadeIn();
      } else {
        shiftData[22] = false;
        $('#patternOn22').fadeOut();
        $('#patternOff22').fadeIn();
      }
    };
    var failure = function() {
      alert("Failed writing data to the bluefruit le");
    };
    var data = stringToBytes("22");
    ble.write(
      deviceId,
      bluefruit.serviceUUID,
      bluefruit.txCharacteristic,
      data, success, failure
    );
  },
  turn23: function() {
    var success = function() {
      if (shiftData[23] == false) {
        shiftData[23] = true;
        $('#patternOff23').fadeOut();
        $('#patternOn23').fadeIn();
      } else {
        shiftData[23] = false;
        $('#patternOn23').fadeOut();
        $('#patternOff23').fadeIn();
      }
    };
    var success1 = function() {
      console.log("success1");
      setTimeout(function() {
        var data1 = stringToBytes("26");
        ble.write(deviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic,
          data1, success, failure
        );
      }, 80);
    };
    var failure = function() {
      alert("Failed writing data to the bluefruit le");
    };
    var data = stringToBytes("23");
    ble.write(
      deviceId,
      bluefruit.serviceUUID,
      bluefruit.txCharacteristic,
      data, success1, failure
    );
  },
  turn27: function() {
    var success = function() {
      if (shiftData[27] == false) {
        shiftData[27] = true;
        $('#patternOff27').fadeOut();
        $('#patternOn27').fadeIn();
      } else {
        shiftData[27] = false;
        $('#patternOn27').fadeOut();
        $('#patternOff27').fadeIn();
      }
    };
    var failure = function() {
      alert("Failed writing data to the bluefruit le");
    };
    var data = stringToBytes("27");
    ble.write(
      deviceId,
      bluefruit.serviceUUID,
      bluefruit.txCharacteristic,
      data, success, failure
    );
  },
  turn28: function() {
    var success = function() {
      if (shiftData[28] == false) {
        shiftData[28] = true;
        $('#patternOff28').fadeOut();
        $('#patternOn28').fadeIn();
      } else {
        shiftData[28] = false;
        $('#patternOn28').fadeOut();
        $('#patternOff28').fadeIn();
      }
    };
    var success1 = function() {
      console.log("success1");
      setTimeout(function() {
        var data1 = stringToBytes("29");
        ble.write(deviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic,
          data1, success, failure
        );
      }, 80);
    };
    var failure = function() {
      alert("Failed writing data to the bluefruit le");
    };
    var data = stringToBytes("28");
    ble.write(
      deviceId,
      bluefruit.serviceUUID,
      bluefruit.txCharacteristic,
      data, success1, failure
    );
  },
  turn30: function() {
    var success = function() {
      if (shiftData[30] == false) {
        shiftData[30] = true;
        $('#patternOff30').fadeOut();
        $('#patternOn30').fadeIn();
      } else {
        shiftData[30] = false;
        $('#patternOn30').fadeOut();
        $('#patternOff30').fadeIn();
      }
    };
    var failure = function() {
      alert("Failed writing data to the bluefruit le");
    };
    var data = stringToBytes("30");
    ble.write(
      deviceId,
      bluefruit.serviceUUID,
      bluefruit.txCharacteristic,
      data, success, failure
    );
  },
  turn31: function() {
    var success = function() {
      if (shiftData[31] == false) {
        shiftData[31] = true;
        $('#patternOff31').fadeOut();
        $('#patternOn31').fadeIn();
      } else {
        shiftData[31] = false;
        $('#patternOn31').fadeOut();
        $('#patternOff31').fadeIn();
      }
    };
    var failure = function() {
      alert("Failed writing data to the bluefruit le");
    };
    var data = stringToBytes("31");
    ble.write(
      deviceId,
      bluefruit.serviceUUID,
      bluefruit.txCharacteristic,
      data, success, failure
    );
  },
  onError: function(reason) {
    alert("ERROR: " + reason); // real apps should use notification.alert
  }
};
