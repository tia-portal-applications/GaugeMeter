interface ChangedDate {
  /** contains the name of the property that was changed */
  readonly key: string;
  /** contains the new value of the property that was changed */
  readonly value: string | number | boolean;
}

interface Contract {
  /** define a new function (e.g. "function method1(result) { ...your code... }") and add it to the corresponding name, that is defined inside the manifest.json, e.g. "MyMethod1" like this: WebCC.start(apiInitialized, {methods: MyMethod1: method1}, ...) */
  methods: Record<string, Function>;
  /** list all events of the manifest.json, e.g. WebCC.start(apiInitialized, {events: ['MyEvent1', 'MyEvent2']}, ...) */
  events: Array<string>;
  /** define all properties of the manifest.json and define start values, e.g. WebCC.start(apiInitialized, {properties: {MyProp1: 55, MyProp2: 'startvalue'}}, ...)
   * IMPORTANT: the start values of the TIA Portal overwrite always these start values (so here they are useless, but must be defined by design of the interface)
   */
  properties: Record<string, (string | number | boolean | object)>;
}

interface HMIExtension {
  /**
   * Use the method "subscribe" inside this object, if you are interested in the changes of the current style
   */
  readonly Style: {
    /** current style of WinCC, e.g. "ExtendedStyle", "FlatStyle_Bright" or "FlatStyle_Dark" */
    readonly Name: string;
    /**
     * Use the method "subscribe" inside this object, if you are interested in the changes of the current style
     */
    readonly onchanged: {
      /**
       * Use this method, if you are interested in the changes of the current style
       * The property "currentStyle" contains the name of the new style, e.g. "ExtendedStyle", "FlatStyle_Bright" or "FlatStyle_Dark"
       */
      subscribe(callbackFunction: { (currentStyle: string): void }): void;
    }
  }
  readonly Properties: {
    /**
     * Use the method "subscribe" inside this object, if you are interested in the changes of any property inside this HMI extension
     */
    readonly onPropertyChanged: {
      /**
       * Use this method, if you are interested in the changes of any property inside this HMI extension
       * @param callbackFunction define a new function (e.g. "function setProperty(changedDate) { ...your code... }") that accepts one parameter (ChangedDate) and pass the function's name to this method like this: WebCC.Extensions.HMI.Properties.onPropertyChanged.subscribe(setProperty);
       */
      subscribe(callbackFunction: { (changedDate: ChangedDate): void }): void;
    };
    /** 
     * read or define the caption. 
     * IMPORTANT: the caption can only be set as a whole object. E.g. if you want to change the text to "foo": WebCC.Extensions.HMI.Properties.Caption = {Text: 'foo'}
     * Or the size: WebCC.Extensions.HMI.Properties.Caption = {Font: {Size: 20}}
     */
    Caption: {
      readonly Font: {
        readonly Name: string;
        readonly Italic: boolean;
        readonly Size: number;
        readonly Underline: boolean;
        readonly StrikeOut: number;
        readonly Weight: number;
        readonly Description: string;
      },
      /** for changing the text or any other property inside the "Caption", the whole object must be set, e.g.: WebCC.Extensions.HMI.Properties.Caption = {Text: 'foo'} */
      readonly Text: string;
      readonly ForeColor: number;
      readonly Visible: boolean;
    },
    /** color of the caption/frame of the CWC */
    CaptionColor: number;
    /** internal ID of the CWC type */
    readonly ContainedType: number;
    /** internal, not in use */
    readonly CurrentQuality: number;
    /** CWC can be clicked by a user or not */
    Enabled: boolean;
    /** color of the caption/frame of the CWC when it is in focus (clicked) */
    FocusColor: number;
    /** define if the CWC is currenly in focus (clicked) */
    readonly HasFocus: boolean;
    /** read or define the height of the CWC container */
    Height: number;
    /** read or define the icon that is shown inside the caption of the CWC container */
    Icon: string;
    /** defines if the current user is monitor only and has less rights */
    readonly IsMonitorMode: boolean;
    /** read the layer of the CWC container */
    readonly Layer: string;
    /** read or define the left position of the CWC container */
    Left: number;
    /** name of this instance of the CWC */
    readonly Name: string;
    /** defines if this CWC instance is operable (only in use, if RequireExplicitUnlock is true) */
    readonly Operability: number;
    /** the current used SVG of the style for the container of the CWC */
    readonly RenderingTemplate: string;
    /** defines if this CWC instance needs an explicit unlock, via click and hold another button, before using it */
    readonly RequireExplicitUnlock: boolean;
    /** read or define if the focus color should be shown when the CWC is in focus or not */
    ShowFocusVisual: boolean;
    /** read or define the tab index of the CWC container */
    TabIndex: number;
    /** read or define the top position of the CWC container */
    Top: number;
    /** read or define the visibility of the CWC */
    Visible: boolean;
    /** read or define the width of the CWC container */
    Width: number;
    /** read or define the window flags of the CWC container for e.g. showing the caption or make it movable, closable, ... */
    WindowFlags: number;
  }
}

interface FormattingExtension {
  /** The "WebCC.Extensions.Formatting.Output" object enables the creation and formatting of text according to the parameters passed. */
  readonly Output: {
    /**
     * Takes any number or random text and formats it according to the parameters passed.
     * Examples: 
     * WebCC.Extensions.Formatting.Output.format(42.1111111, '{F2}', 'de-DE'); // result: 42,11
     * WebCC.Extensions.Formatting.Output.format(45054, '{H,2}'); // result: AF FE
     * WebCC.Extensions.Formatting.Output.format(1609745948315, '{D,@yyyy/MM/dd} {T,@HH:mm:ss}'); // result: 2021/01/04 07:39:08
     * @param value input value to be formatted
     * @param pattern format pattern, see also TIA Portal formatting
     * @param lcid The language can optionally be specified via the LCID or ISO language. When the LCID is not transferred, the current language is used.
     * It is possible to pass strings like 'en-US', 'de-DE' or also numbers like 1033, 1031
     */
    format(value: (number | string), pattern: string, lcid?: string | number): void;
  }
}

interface WebCC {
  /**
   * Use the method "subscribe" inside this object, if you are interested in the changes of the connected WinCC tags (possibly a PLC tag)
   */
  readonly onPropertyChanged: {
    /**
     * Use this method, if you are interested in the changes of the connected WinCC tags (possibly a PLC tag)
     * @param callbackFunction define a new function (e.g. "function setProperty(changedDate) { ...your code... }") that accepts one parameter (ChangedDate) and pass the function's name to this method like this: WebCC.onPropertyChanged.subscribe(setProperty);
     */
    subscribe(callbackFunction: { (changedDate: ChangedDate): void }): void;
  };
  /**
   * If you have specified an event in the manifest.json file, you can trigger this event at any point in your code with the method "fire" 
   * inside this object, so that WinCC will be notified. IMPORTANT: events can only be used, if they are declared in the "start" method
   */
  readonly Events: {
    /**
     * If you have specified an event in the manifest.json file, you
     * can trigger this event at any point in your code with this method, so that WinCC will be notified.
     * IMPORTANT: events can only be used, if they are declared in the "start" method
     * @param eventName name of the event inside the manifest.json
     * @param parameters pass every parameter of the event seperated by a comma, e.g. WebCC.Events.fire('EventWith3Parameters', 55, 'Param2', true);
     */
    fire(eventName: string, ...parameters: (number | string | boolean)[]): void;
  };
  /**
   * initialize the API object first, before using any other function.
   * IMPORTANT: this function must be called on startup of the CustomWebControl, otherwise its content will be blocked in the runtime
   * @param callbackFunction define a new function (e.g. "function apiInitialized(result) { ...your code... }") that accepts one parameter (result) and pass the function's name to this method like this: WebCC.start(apiInitialized, ...);
   * @param contract object that contains the contract inside manifest.json
   * @param additionalExtensions include additional Unified dependencies. Currently the following are allowed: "HMI", "Formatting", "Dialog". Usage: e.g. ['HMI', 'Formatting'] to include the "HMI" and "Formatting" extension
   * @param timeout set a timeout for establishing the connection
   */
  start(callbackFunction: { (result: boolean): void }, contract: Contract, additionalExtensions: Array<string>, timeout: number): void;
  /**
   * Reading or writing properties of the CWC (that are also declared in manifest.json) can be done via e.g. WebCC.Properties.MyProp = 5;
   * IMPORTANT: Properties can only be read or written to, if they are added into the contract of the "start" method
   */
  readonly Properties: Record<string, (string | number | boolean | object)>;
  /** defines, if the CWC is currently in TIA Portal (true) or in Runtime (false). If true, a dummy screen could be shown for TIA Portal */
  readonly isDesignMode: boolean;
  /** current language of WinCC in ISO format like this: 'en-US', 'de-DE', ... */
  readonly language: string;
  /** Use the method "subscribe" inside this object, if you are interested in the changes of the current language of WinCC */
  readonly onLanguageChanged: {
    /**
     * Use this method, if you are interested in the changes of the current language of WinCC
     * @param callbackFunction define a new function (e.g. "function languageChanged(currentLanguage) { ...your code... }") that accepts one parameter (currentLanguage) and pass the function's name to this method like this: WebCC.onLanguageChanged.subscribe(languageChanged);
     * HINT: The parameter "currentLanguage" contains the language in the ISO format like this: 'en-US', 'de-DE', ...
     */
    subscribe(callbackFunction: { (currentLanguage: string): void }): void;
  };
  /** Contains all extension packages. IMPORTANT: extensions can only be used, if they are declared in the "start" method */
  readonly Extensions: {
    readonly HMI?: HMIExtension;
    readonly Formatting?: FormattingExtension;
  };
}

/** The API object (WebCC) represents the interface through which the methods, events and properties of the Control are called or received from WinCC Unified. */
declare var WebCC: WebCC;
