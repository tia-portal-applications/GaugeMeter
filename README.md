# GaugeMeter

The GaugeMeter CWC is also officially released in SIOS (https://support.industry.siemens.com/cs/ww/en/view/109779176)

## Getting Started

These instructions will get you a copy of the project up and running on your 
local machine for development and testing purposes. See deployment for notes 
on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

* [Visual Studio Code](https://code.visualstudio.com/) - JavaScript code IDE
* [SIMATIC WinCC Unified](https://support.industry.siemens.com/cs/ww/en/view/109771777) - running environment for testing

### Installing

A step by step series of examples that tell you how to get a development env running

1. Create a new WinCC Unified project in TIA Portal and add a Unified PC station or Unified Comfort Panel
2. Close TIA Portal
3. Add the file {551BF148-2F0D-4293-99C2-C9C3A1A6A073}.zip to the project folder: "UserFiles\CustomControls"
4. Start TIA Portal and open a WinCC Unified screen
5. Drag&Drop the CustomWebControl from the toolbox on the right under tab "My controls" into to the screen
6. Download and start the runtime locally (use simulation)
7. Open your browser and see the CustomWebControl
8. Open windows explorer in folder path: C:\Users\Public\Documents\Siemens\WebUX\_ResourceCache\\_CustomWebControls
9. You will find the code of the CustomWebControl in a sub folder here (e.g. 1.312.0.0.0.0)
10. Edit the code and refresh the WinCC Unified website to see your changes immediately
11. Be careful: After a restart of the runtime your changes are lost, so keep & commit them in a version control system like GIT (code.siemens.com)

## Running the tests

There are no automated tests yet for this CustomWebControl

## Deployment

This chapter only describes how to create a new CustomWebControl from the given code. The deployment on a running system is described in "Installating"

## Built With

* zip: In the windows explorer select the folders "control" and "assets", as well as the filei "manifest.json", then right click and send to zip archive. Give the name "{551BF148-2F0D-4293-99C2-C9C3A1A6A073}.zip" and it is ready to use!

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## License

see [LICENSE.md](LICENSE.md)

## Acknowledgments

* [Gauge.js](https://bernii.github.io/gauge.js/) was used in this project as 3rd party library for the visualization of the gauge
