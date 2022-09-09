// Copyright 2022 Siemens AG. This file is subject to the terms and conditions of the MIT License. See LICENSE file in the top-level directory.
//
// SPDX-License-Identifier: MIT


////////////////////////////////////////////
// Helper functions

// Convert a WinCC Unified color number to a standard HTML5 color string, 
// e.g. "0xFF00FF00" (#Alpha-Red-Green-Blue) to "rgba(0,255,0,255)" (rgba(Red,Green,Blue,Alpha))
function toColor(num) {
  num >>>= 0;
  var b = num & 0xFF,
    g = (num & 0xFF00) >>> 8,
    r = (num & 0xFF0000) >>> 16,
    a = ((num & 0xFF000000) >>> 24) / 255;

  return 'rgba(' + [r, g, b, a].join(',') + ')';
}

////////////////////////////////////////////
// Gauge internal properties

// access all properties of the shown gauge with this property "gauge". It will be initialized by the function "initializeGauge()"
let gauge;
// get or set the index of the zone the value is currently in
let currentZoneIndex = -1;


////////////////////////////////////////////
// Gauge functions

// Paints the gauge with default values when the control is initialized. This function should only be called ones in the beginning.
function initializeGauge() {
  const options = {
    pointer: {
      length: 0.6, // // Relative to gauge radius
      strokeWidth: 0.035, // The thickness
      color: '#000000' // Fill color
    },
    limitMax: true,
    limitMin: true,
    generateGradient: true,
    highDpiSupport: true,     // High resolution support
    // renderTicks is Optional
    renderTicks: {
      divisions: 5,
      divWidth: 1.1,
      divLength: 0.7,
      divColor: '#333333',
      subDivisions: 3,
      subLength: 0.5,
      subWidth: 0.6,
      subColor: '#666666'
    },
    staticZones: []
  };
  gauge = new Gauge(document.getElementById('gauge')).setOptions(options);
  gauge.animationSpeed = 11;
}

// Updates the value shown by the gauge whenever it is changed, e.g. by a WinCC Unified tag or script.
// This function will be called by "setProperty" whenever the contract property GaugeValue is changed.
// - value: number that contains the new value to be shown in the gauge meter.
function updateValue(value) {
  gauge.set(value);
  const newZoneIndex = gauge.options.staticZones.indexOf(
    gauge.options.staticZones.
      filter(zone => zone.min <= gauge.value && gauge.value <= zone.max).pop()
  );
  if (newZoneIndex != currentZoneIndex) {
    currentZoneIndex = newZoneIndex;
    WebCC.Events.fire('ZoneChanged', newZoneIndex);
  }
}

// Updates the alignment of the whole gauge inside the control. You can place it at the top, middle or bottom.
// This function will be called by "setProperty" whenever the user changes the alignment.
// - alignment: object that contains an enum property "Vertical" that can be either "Top", "Center" or "Bottom".
function updateAlignment(alignment) {
  const item = document.getElementById('gauge');
  let vertVal = '0';
  let topVal = '0';
  switch (alignment.Vertical) {
    case 'Top':
      break;
    case 'Center':
      topVal = '50%';
      vertVal = '-50%';
      break;
    case 'Bottom':
      topVal = 'inherit';
      break;
  }
  item.style.top = topVal;
  item.style.transform = 'translate(0,' + vertVal + ')';
}

// Updates the labels of the gauge. All labels have to be updated whenever the DivisionCount, MaxValue, MinValue or FontSize is changed. 
// This function will be called by "setProperty" whenever one of those contract properties change.
function updateLabels() {
  const labels = new Array(WebCC.Properties.DivisionCount).fill(0).map(
    (x, i) => (i + 1) * (WebCC.Properties.MaxValue - WebCC.Properties.MinValue) / WebCC.Properties.DivisionCount + WebCC.Properties.MinValue
  );
  labels.unshift(WebCC.Properties.MinValue);
  gauge.setOptions({
    staticLabels: {
      font: WebCC.Properties.FontSize + 'px "Siemens Sans"',
      labels: labels
    }
  });
}

// Paints the given zones inside the gauge. This function will be called by "setProperty" whenever a zone is changed or 
// zones will be added or removed.
// - zones: array of new zones to be painted
function updateZones(zones) {
  gauge.setOptions({
    staticZones: zones.map(item => {
      return { strokeStyle: toColor(item.StrokeColor), min: item.Min, max: item.Max };
    })
  });
}

// This is a callback function that is called every time a contract property changes. The function forwards the change to 
// other functions so you can see the new value in the control.
// - data: object containing a key and a value property. The "key" contains the name of the changed contract property and 
//         the "value" contains the new value.
function setProperty(data) {
  // console.log('onPropertyChanged ' + data.key);  // uncomment this line to check whether data is incoming in the browser console from WinCC Unified
  switch (data.key) {
    case 'GaugeValue':
      updateValue(data.value);
      break;
    case 'GaugeBackColor':
      document.body.style.backgroundColor = toColor(data.value);
      break;
    case 'Alignment':
      updateAlignment(data.value);
      break;
    case 'LineThickness':
      gauge.setOptions({ lineWidth: data.value / 100 });
      break;
    case 'FontSize':
      updateLabels();
      break;
    case 'MinValue':
      gauge.setMinValue(data.value);
      updateLabels();
      break;
    case 'MaxValue':
      gauge.maxValue = data.value;
      updateLabels();
      break;
    case 'DivisionCount':
      updateLabels();
      break;
    case 'Zones':
      updateZones(data.value);
      break;
  }
}

// Let the given zone blink by descreasing and increasing the alpha value of the zone color from 0% zu 100% and 
// back to orininal value 2 times.
// - zoneIndex: integer as index of the zone that will blink.
function blinkZone(zoneIndex) {
  const currentZone = gauge.options.staticZones[zoneIndex];
  const rgba = currentZone.strokeStyle.split(',');
  const originalRgba = Number(rgba[3].replace(')', ''));
  let currentRgba = originalRgba;
  let state = 0; // 0: falling, 1: raising, 2: falling again
  let currentRound = 0;
  const timerId = setInterval(() => {
    switch (state) {
      case 0:
        currentRgba -= 0.2;
        if (currentRgba <= 0) {
          currentRgba = 0;
          state = 1;
        }
        break;
      case 1:
        currentRgba += 0.2;
        if (currentRgba >= 1) {
          currentRgba = 1;
          state = 2;
        }
        break;
      case 2:
        currentRgba -= 0.2;
        if (currentRgba < originalRgba) {
          currentRound++;
          if (currentRound >= 2) {
            clearInterval(timerId);
            return;
          } else {
            currentRgba = originalRgba;
            state = 0;
          }
        }
        break;
    }
    rgba[3] = currentRgba.toFixed(1);
    currentZone.strokeStyle = rgba.join(',') + ')';
    gauge.setOptions(gauge.options.staticZones);
  }, 50);
}

//override setOptions in order to prevent black dot in top left corner: https://github.com/bernii/gauge.js/issues/192
Gauge.prototype.setOptions = function (options) {
  var gauge, j, len, phi, ref;

  if (options == null) {
    options = null;
  }

  Gauge.__super__.setOptions.call(this, options);

  this.configPercentColors();
  this.extraPadding = 0;

  if (this.options.angle < 0) {
    phi = Math.PI * (1 + this.options.angle);
    this.extraPadding = Math.sin(phi);
  }

  this.availableHeight = this.canvas.height * (1 - this.paddingTop - this.paddingBottom);
  this.lineWidth = this.availableHeight * this.options.lineWidth;
  this.radius = (this.availableHeight - this.lineWidth / 2) / (1.0 + this.extraPadding);
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  ref = this.gp;

  for (j = 0, len = ref.length; j < len; j++) {
    gauge = ref[j];
    gauge.setOptions(this.options.pointer);
    // gauge.render(); Line deleted which will fix your problem !!!!
  }

  this.render();
  return this;
};
////////////////////////////////////////////
// Initialize the custom control
WebCC.start(
  // callback function; occurs when the connection is done or failed. 
  // "result" is a boolean defining if the connection was successfull or not.
  function (result) {
    if (result) {
      console.log('connected successfully');
      initializeGauge();
      // Set current values
      setProperty({ key: 'GaugeBackColor', value: WebCC.Properties.GaugeBackColor });
      setProperty({ key: 'Alignment', value: WebCC.Properties.Alignment });
      setProperty({ key: 'LineThickness', value: WebCC.Properties.LineThickness });
      setProperty({ key: 'DivisionCount', value: WebCC.Properties.DivisionCount });
      setProperty({ key: 'FontSize', value: WebCC.Properties.FontSize });
      setProperty({ key: 'Zones', value: WebCC.Properties.Zones });
      setProperty({ key: 'MaxValue', value: WebCC.Properties.MaxValue });
      setProperty({ key: 'MinValue', value: WebCC.Properties.MinValue });
      setProperty({ key: 'GaugeValue', value: WebCC.Properties.GaugeValue });
      // Subscribe for value changes
      WebCC.onPropertyChanged.subscribe(setProperty);
    }
    else {
      console.log('connection failed');
    }
  },
  // contract (see also manifest.json)
  {
    // Methods
    methods: {
      BlinkZone: function (zoneIndex) {
        if (currentZoneIndex >= 0 && zoneIndex < gauge.options.staticZones.length) {
          blinkZone(zoneIndex);
        }
      }
    },
    // Events
    events: ['ZoneChanged'],
    // Properties
    properties: {
      GaugeValue: 20,
      GaugeBackColor: 4294967295,
      Alignment:
      {
        Vertical: 'Center'
      },
      LineThickness: 20,
      FontSize: 16,
      MinValue: 0,
      MaxValue: 50,
      DivisionCount: 5,
      Zones: [
        { Min: 0, Max: 30, StrokeColor: 4281381677 },
        { Min: 30, Max: 40, StrokeColor: 4294958336 },
        { Min: 40, Max: 50, StrokeColor: 4293934654 }
      ]
    }
  },
  // placeholder to include additional Unified dependencies (not used in this example)
  [],
  // connection timeout
  10000
);