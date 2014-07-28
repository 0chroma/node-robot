/*
Adapted from https://github.com/inductivekickback/ev3/blob/master/ev3/direct_command.py
*/

var MAX_CMD_LEN = 1019;       // The size of the brick's txBuf is 1024 bytes but
                              // the header requires 5 bytes.
var MAX_STR_LEN = 255;
var MAX_VERSION_STR_LEN = 64;
var MAX_LOCAL_VARIABLE_BYTES = 0xFFFFFFFF;

var MAX_NAME_STR_LEN = 64;

var MOTOR_MIN_POWER = -100;
var MOTOR_MAX_POWER = 100;

var MOTOR_MIN_SPEED = -100;
var MOTOR_MAX_SPEED = 100;

var USB_CHAIN_LAYER_MASTER = 0;
var USB_CHAIN_LAYER_SLAVE = 1;

var MOTOR_MIN_RATIO = -200;
var MOTOR_MAX_RATIO = 200;

var MIN_VOLUME = 0;
var MAX_VOLUME = 100;

var LCD_HEIGHT_PIXELS = 128;
var LCD_WIDTH_PIXELS = 178;

var CommandType = {
    /*Every System Command must be one of these two types.*/
    DIRECT_COMMAND_REPLY    : 0x00,
    DIRECT_COMMAND_NO_REPLY : 0x80
}

var ReplyType = {
    /*Every reply to a System Command must be one of these two types.*/
    DIRECT_REPLY            : 0x02,
    DIRECT_REPLY_ERROR      : 0x04
}

var OutputPort = {
    /*These can be OR'd together to operate on multiple ports at once.*/
    PORT_A   : 0x01,
    PORT_B   : 0x02,
    PORT_C   : 0x04,
    PORT_D   : 0x08
}

OutputPort.ALL = OutputPort.PORT_A | OutputPort.PORT_B | OutputPort.PORT_C | OutputPort.PORT_D;

var InputPort = {
    /*These can be OR'd together to operate on multiple ports at once.*/
    PORT_1   : 0x00,
    PORT_2   : 0x01,
    PORT_3   : 0x02,
    PORT_4   : 0x03,
    PORT_A   : 0x10,
    PORT_B   : 0x11,
    PORT_C   : 0x12,
    PORT_D   : 0x13
}

var StopType = {
    /*When an OutputPort is stopped it can be told to brake or coast.*/
    COAST   : 0,
    BRAKE   : 1
}

var PolarityType = {
    BACKWARD    : -1,
    TOGGLE      : 0,
    FORWARD     : 1
}

var TouchMode = {
    TOUCH   : 0,
    BUMPS   : 1
}

var NXTLightMode = {
    REFLECT : 0,
    AMBIENT : 1
}

var NXTSoundMode = {
    DECIBELS            : 0,
    ADJUSTED_DECIBLES   : 1
}

var NXTColorMode = {
    REFLECTIVE  : 0,
    AMBIENT     : 1,
    COLOR       : 2,
    GREEN       : 3,
    BLUE        : 4,
    RAW         : 5
}

var NXTUltrasonicMode = {
    CM      : 0,
    INCHES  : 1
}

var NXTTemperatureMode = {
    CELSIUS     : 0,
    FAHRENHEIT  : 1
}

var MotorMode = {
    DEGREES     : 0,
    ROTATIONS   : 1,
    PERCENT     : 2
}

var UltrasonicMode = {
    CM      : 0,
    INCH    : 1,
    LISTEN  : 2
}

var GyroMode = {
    ANGLE   : 0,
    RATE    : 1,
    FAS     : 2,
    G_AND_A : 3
}

var IRMode = {
    PROXIMITY   : 0,
    SEEK        : 1,
    REMOTE      : 2,
    REMOTE_A    : 3,
    SALT        : 4,
    CALIBRATION : 5
}

var ColorMode = {
    RELECTIVE   : 0,
    AMBIENT     : 1,
    COLOR       : 2
}

var ColorSensorColor = {
    /*These are the results that the EV3 color sensor can return when operating
    in ColorMode.COLOR.

    */
    NONE    : 0,
    BLACK   : 1,
    BLUE    : 2,
    GREEN   : 3,
    YELLOW  : 4,
    RED     : 5,
    WHITE   : 6,
    BROWN   : 7
}

var LEDPattern = {
    /*The brick user interface has several status LEDs.*/
    OFF                 : 0,
    GREEN               : 1,
    RED                 : 2,
    ORANGE              : 3,
    FLASHING_GREEN      : 4,
    FLASHING_RED        : 5,
    FLASHING_ORANGE     : 6,
    GREEN_HEARTBEAT     : 7,
    RED_HEARTBEAT       : 8,
    ORANGE_HEARTBEAT    : 9
}

var DeviceType = {
    /*These are the known device types.

    NOTE:   These have only been partially confirmed.

    */
    NXT_TOUCH           : 0x01,
    NXT_LIGHT           : 0x02,
    NXT_SOUND           : 0x03,
    NXT_COLOR           : 0x04,
    NXT_ULTRASONIC      : 0x05,
    NXT_TEMPERATURE     : 0x06,
    TACHO               : 0x07,  // TYPE_TACHO in lms2012.h
    MINI_TACHO          : 0x08,  // TYPE_MINITACHO in lms2012.h
    NEW_TACHO           : 0x09,  // TYPE_NEWTACHO in lms2012.h
    EV3_TOUCH           : 0x10,
    EV3_COLOR           : 0x1D,
    EV3_ULTRASONIC      : 0x1E,
    EV3_GYROSCOPE       : 0x20,
    EV3_INFRARED        : 0x21,
    SENSOR_INITIALIZING : 0x7D,
    PORT_EMPTY          : 0x7E,
    ERROR_PORT          : 0x7F,
    UNKNOWN             : 0xFF
}

var LCDColor = {
    /*The brick's LCD only displays two colors.*/
    BACKGROUND : 0,
    FOREGROUND : 1
}

var ButtonType = {
    /*The brick's user interface contains 6 buttons.*/
    NO_BUTTON       : 0,
    UP_BUTTON       : 1,
    ENTER_BUTTON    : 2,
    DOWN_BUTTON     : 3,
    RIGHT_BUTTON    : 4,
    LEFT_BUTTON     : 5,
    BACK_BUTTON     : 6,
    ANY_BUTTON      : 7
}

var MathType = {
    EXP       : 1,     // e^x            r : expf(x)
    MOD       : 2,     // Modulo         r : fmod(x,y)
    FLOOR     : 3,     // Floor          r : floor(x)
    CEIL      : 4,     // Ceiling        r : ceil(x)
    ROUND     : 5,     // Round          r : round(x)
    ABS       : 6,     // Absolute       r : fabs(x)
    NEGATE    : 7,     // Negate         r : 0.0 - x
    SQRT      : 8,     // Squareroot     r : sqrt(x)
    LOG       : 9,     // Log            r : log10(x)
    LN        : 10,    // Ln             r : log(x)
    SIN       : 11,
    COS       : 12,
    TAN       : 13,
    ASIN      : 14,
    ACOS      : 15,
    ATAN      : 16,
    MOD8      : 17,    // Modulo DATA8   r : x % y
    MOD16     : 18,    // Modulo DATA16  r : x % y
    MOD32     : 19,    // Modulo DATA32  r : x % y
    POW       : 20,    // Exponent       r : powf(x,y)
    TRUNC     : 21    // Truncate       r : (float)((int)(x * pow(y))) / pow(y)
}

var BrowserType = {
    BROWSE_FOLDERS      : 0, // Browser for folders
    BROWSE_FOLDS_FILES  : 1, // Browser for folders and files
    BROWSE_CACHE        : 2, // Browser for cached / recent files
    BROWSE_FILES        : 3 // Browser for files
}

var Icon = {
    /*The icons on the brick are enumerated by value.*/
    ICON_NONE           : -1,
    ICON_RUN            : 0,
    ICON_FOLDER         : 1,
    ICON_FOLDER2        : 2,
    ICON_USB            : 3,
    ICON_SD             : 4,
    ICON_SOUND          : 5,
    ICON_IMAGE          : 6,
    ICON_SETTINGS       : 7,
    ICON_ONOFF          : 8,
    ICON_SEARCH         : 9,
    ICON_WIFI           : 10,
    ICON_CONNECTIONS    : 11,
    ICON_ADD_HIDDEN     : 12,
    ICON_TRASHBIN       : 13,
    ICON_VISIBILITY     : 14,
    ICON_KEY            : 15,
    ICON_CONNECT        : 16,
    ICON_DISCONNECT     : 17,
    ICON_UP             : 18,
    ICON_DOWN           : 19,
    ICON_WAIT1          : 20,
    ICON_WAIT2          : 21,
    ICON_BLUETOOTH      : 22,
    ICON_INFO           : 23,
    ICON_TEXT           : 24,
    ICON_QUESTIONMARK   : 27,
    ICON_INFO_FILE      : 28,
    ICON_DISC           : 29,
    ICON_CONNECTED      : 30,
    ICON_OBP            : 31,
    ICON_OBD            : 32,
    ICON_OPENFOLDER     : 33,
    ICON_BRICK1         : 34
}

var FontType = {
    NORMAL_FONT : 0,
    SMALL_FONT  : 1,
    LARGE_FONT  : 2,
    TINY_FONT   : 3
}

var DataFormat = {
    /*Data formats that are used by the VM.*/
    DATA8       : 0x00,
    DATA16      : 0x01,
    DATA32      : 0x02,
    DATA_F      : 0x03,  // 32bit floating point value (single precision)
    DATA_S      : 0x04,  // Zero terminated string
    DATA_A      : 0x05,  // Array handle
    DATA_V      : 0x07,  // Variable type
    DATA_PCT    : 0x10,  // Percent (used in INPUT_READEXT)
    DATA_RAW    : 0x12,  // Raw     (used in INPUT_READEXT)
    DATA_SI     : 0x13,  // SI unit (used in INPUT_READEXT)
    // Values used by this Python module only:
    HND         : 0xFF,  // For compatibility with ParamTypes.
    BOOL        : 0xFE  // For converting to Python values
}

var ParamType = {
    /*Parameter types that are used by the VM.*/
    PRIMPAR_LABEL   : 0x20,
    HND             : 0x10,  // 8bit handle index (i.e. pointer to a string)
    ADR             : 0x08,  // 3bit address
    LCS             : 0x84,  // Null terminated string
    LAB1            : 0xA0,
    LC0             : 0x00,  // 6bit immediate
    LC1             : 0x81,  // 8bit immediate
    LC2             : 0x82,  // 16bit immediate
    LC4             : 0x83,  // 32bit immediate
    LCA             : 0x81,  // 8bit pointer to local array
    LV1             : 0xC1,  // 8bit pointer to local value
    LV2             : 0xC2,  // 16bit pointer to local value
    LV4             : 0xC3,  // 32bit pointer to local value
    LVA             : 0xC1,  // 8bit pointer to local array
    GV0             : 0x60,  // 5bit pointer to global value
    GV1             : 0xE1,  // 8bit pointer to global value
    GV2             : 0xE2,  // 16bit pointer to global value
    GV4             : 0xE3,  // 32bit pointer to global value
    GVA             : 0xE1,  // 8bit pointer to global array
    // Values used by this Python module only:
    FLOAT           : 0xFF,  // 32bit floating point value (single precision)
}

// Defines the number of bytes required to represent each DataFormat.
var PARAM_TYPE_LENS = {}
PARAM_TYPE_LENS[ParamType.PRIMPAR_LABEL] =    null;
PARAM_TYPE_LENS[ParamType.HND] =              1;
PARAM_TYPE_LENS[ParamType.ADR] =              1;
PARAM_TYPE_LENS[ParamType.LCS] =              null;
PARAM_TYPE_LENS[ParamType.LAB1] =             1;
PARAM_TYPE_LENS[ParamType.LC0] =              0;
PARAM_TYPE_LENS[ParamType.LC1] =              1;
PARAM_TYPE_LENS[ParamType.LC2] =              2;
PARAM_TYPE_LENS[ParamType.LC4] =              4;
PARAM_TYPE_LENS[ParamType.LCA] =              1;
PARAM_TYPE_LENS[ParamType.LV1] =              1;
PARAM_TYPE_LENS[ParamType.LV2] =              2;
PARAM_TYPE_LENS[ParamType.LV4] =              4;
PARAM_TYPE_LENS[ParamType.LVA] =              1;
PARAM_TYPE_LENS[ParamType.GV0] =              0;
PARAM_TYPE_LENS[ParamType.GV1] =              1;
PARAM_TYPE_LENS[ParamType.GV2] =              2;
PARAM_TYPE_LENS[ParamType.GV4] =              4;
PARAM_TYPE_LENS[ParamType.GVA] =              1;
PARAM_TYPE_LENS[ParamType.FLOAT] =            4;

var DATA_FORMAT_LENS = {};
DATA_FORMAT_LENS[DataFormat.DATA8] =       1;
DATA_FORMAT_LENS[DataFormat.DATA16] =      2;
DATA_FORMAT_LENS[DataFormat.DATA32] =      4;
DATA_FORMAT_LENS[DataFormat.DATA_F] =      4;
DATA_FORMAT_LENS[DataFormat.DATA_S] =      null;
DATA_FORMAT_LENS[DataFormat.DATA_A] =      null;
DATA_FORMAT_LENS[DataFormat.DATA_V] =      null;
DATA_FORMAT_LENS[DataFormat.DATA_PCT] =    1;
DATA_FORMAT_LENS[DataFormat.DATA_RAW] =    4;
DATA_FORMAT_LENS[DataFormat.DATA_SI] =     4;
DATA_FORMAT_LENS[DataFormat.HND] =         1;
DATA_FORMAT_LENS[DataFormat.BOOL] =        1;

// There are two ways to specify an output in the c_output module. The first is
// as a bit mask and the second is by index.
var OUTPUT_CHANNEL_TO_INDEX = {}
OUTPUT_CHANNEL_TO_INDEX[OutputPort.PORT_A] = 0;
OUTPUT_CHANNEL_TO_INDEX[OutputPort.PORT_B] = 1;
OUTPUT_CHANNEL_TO_INDEX[OutputPort.PORT_C] = 2;
OUTPUT_CHANNEL_TO_INDEX[OutputPort.PORT_D] = 3;

var UIReadSubcode = {
    GET_VBATT     : 1,
    GET_IBATT     : 2,
    GET_OS_VERS   : 3,
    GET_EVENT     : 4,
    GET_TBATT     : 5,
    GET_IINT      : 6,
    GET_IMOTOR    : 7,
    GET_STRING    : 8,
    GET_HW_VERS   : 9,
    GET_FW_VERS   : 10,
    GET_FW_BUILD  : 11,
    GET_OS_BUILD  : 12,
    GET_ADDRESS   : 13,
    GET_CODE      : 14,
    KEY           : 15,
    GET_SHUTDOWN  : 16,
    GET_WARNING   : 17,
    GET_LBATT     : 18,
    TEXTBOX_READ  : 21,
    GET_VERSION   : 26,
    GET_IP        : 27,
    GET_POWER     : 29,
    GET_SDCARD    : 30,
    GET_USBSTICK  : 31
}

var UIWriteSubcode = {
    WRITE_FLUSH     : 1,
    FLOATVALUE      : 2,
    STAMP           : 3,
    PUT_STRING      : 8,
    VALUE8          : 9,
    VALUE16         : 10,
    VALUE32         : 11,
    VALUEF          : 12,
    ADDRESS         : 13,
    CODE            : 14,
    DOWNLOAD_END    : 15,
    SCREEN_BLOCK    : 16,
    TEXTBOX_APPEND  : 21,
    SET_BUSY        : 22,
    SET_TESTPIN     : 24,
    INIT_RUN        : 25,
    UPDATE_RUN      : 26,
    LED             : 27,
    POWER           : 29,
    GRAPH_SAMPLE    : 30,
    TERMINAL        : 31
}

var UIButtonSubcode = {
    SHORTPRESS      : 1,
    LONGPRESS       : 2,
    WAIT_FOR_PRESS  : 3,
    FLUSH           : 4,
    PRESS           : 5,
    RELEASE         : 6,
    GET_HORZ        : 7,
    GET_VERT        : 8,
    PRESSED         : 9,
    SET_BACK_BLOCK  : 10,
    GET_BACK_BLOCK  : 11,
    TESTSHORTPRESS  : 12,
    TESTLONGPRESS   : 13,
    GET_BUMBED      : 14,
    GET_CLICK       : 15
}

var COMGetSubcodes = {
    GET_ON_OFF      : 1,     // Set, Get
    GET_VISIBLE     : 2,     // Set, Get
    GET_RESULT      : 4,     // Get
    GET_PIN         : 5,     // Set, Get
    SEARCH_ITEMS    : 8,     // Get
    SEARCH_ITEM     : 9,     // Get
    FAVOUR_ITEMS    : 10,    // Get
    FAVOUR_ITEM     : 11,    // Get
    GET_ID          : 12,
    GET_BRICKNAME   : 13,
    GET_NETWORK     : 14,
    GET_PRESENT     : 15,
    GET_ENCRYPT     : 16,
    CONNEC_ITEMS    : 17,
    CONNEC_ITEM     : 18,
    GET_INCOMING    : 19,
    GET_MODE2       : 20
}

var COMSetSubcode = {
    SET_ON_OFF      : 1,     // Set, Get
    SET_VISIBLE     : 2,     // Set, Get
    SET_SEARCH      : 3,     // Set
    SET_PIN         : 5,     // Set, Get
    SET_PASSKEY     : 6,     // Set
    SET_CONNECTION  : 7,     // Set
    SET_BRICKNAME   : 8,
    SET_MOVEUP      : 9,
    SET_MOVEDOWN    : 10,
    SET_ENCRYPT     : 11,
    SET_SSID        : 12,
    SET_MODE2       : 13
}

var InputDeviceSubcode = {
    GET_FORMAT      : 2,
    CAL_MINMAX      : 3,
    CAL_DEFAULT     : 4,
    GET_TYPEMODE    : 5,
    GET_SYMBOL      : 6,
    CAL_MIN         : 7,
    CAL_MAX         : 8,
    SETUP           : 9,     // Probably only for internal use.
    CLR_ALL         : 10,    // Resets counters, angle, etc.
    GET_RAW         : 11,
    GET_CONNECTION  : 12,
    STOP_ALL        : 13,    // Stops any attached motors?
    GET_NAME        : 21,
    GET_MODENAME    : 22,
    SET_RAW         : 23,
    GET_FIGURES     : 24,
    GET_CHANGES     : 25,
    CLR_CHANGES     : 26,
    READY_PCT       : 27,
    READY_RAW       : 28,
    READY_SI        : 29,
    GET_MINMAX      : 30,
    GET_BUMPS       : 31
}

var ProgramInfoSubcode = {
    OBJ_STOP        : 0,
    OBJ_START       : 4,
    GET_STATUS      : 22,
    GET_SPEED       : 23,
    GET_PRGRESULT   : 24,
    SET_INSTR       : 25
}

var UIDrawSubcode = {
    UPDATE          : 0,
    CLEAN           : 1,
    PIXEL           : 2,
    LINE            : 3,
    CIRCLE          : 4,
    TEXT            : 5,
    ICON            : 6,
    PICTURE         : 7,
    VALUE           : 8,
    FILLRECT        : 9,
    RECT            : 10,
    NOTIFICATION    : 11,
    QUESTION        : 12,
    KEYBOARD        : 13,
    BROWSE          : 14,
    VERTBAR         : 15,
    INVERSERECT     : 16,
    SELECT_FONT     : 17,
    TOPLINE         : 18,
    FILLWINDOW      : 19,
    SCROLL          : 20,
    DOTLINE         : 21,
    VIEW_VALUE      : 22,
    VIEW_UNIT       : 23,
    FILLCIRCLE      : 24,
    STORE           : 25,
    RESTORE         : 26,
    ICON_QUESTION   : 27,
    BMPFILE         : 28,
    POPUP           : 29,
    GRAPH_SETUP     : 30,
    GRAPH_DRAW      : 31,
    TEXTBOX         : 32
}

var FileSubcode = {
    OPEN_APPEND         : 0,
    OPEN_READ           : 1,
    OPEN_WRITE          : 2,
    READ_VALUE          : 3,
    WRITE_VALUE         : 4,
    READ_TEXT           : 5,
    WRITE_TEXT          : 6,
    CLOSE               : 7,
    LOAD_IMAGE          : 8,
    GET_HANDLE          : 9,
    MAKE_FOLDER         : 10,
    GET_POOL            : 11,
    SET_LOG_SYNC_TIME   : 12,
    GET_FOLDERS         : 13,
    GET_LOG_SYNC_TIME   : 14,
    GET_SUBFOLDER_NAME  : 15,
    WRITE_LOG           : 16,
    CLOSE_LOG           : 17,
    GET_IMAGE           : 18,
    GET_ITEM            : 19,
    GET_CACHE_FILES     : 20,
    PUT_CACHE_FILE      : 21,
    GET_CACHE_FILE      : 22,
    DEL_CACHE_FILE      : 23,
    DEL_SUBFOLDER       : 24,
    GET_LOG_NAME        : 25,
    OPEN_LOG            : 27,
    READ_BYTES          : 28,
    WRITE_BYTES         : 29,
    REMOVE              : 30,
    MOVE                : 31
}

var ArraySubcode = {
    DELETE          : 0,
    CREATE8         : 1,
    CREATE16        : 2,
    CREATE32        : 3,
    CREATEF         : 4,
    RESIZE          : 5,
    FILL            : 6,
    COPY            : 7,
    INIT8           : 8,
    INIT16          : 9,
    INIT32          : 10,
    INITF           : 11,
    SIZE            : 12,
    READ_CONTENT    : 13,
    WRITE_CONTENT   : 14,
    READ_SIZE       : 15
}

var FilenameSubcode = {
    EXIST           : 16,    // MUST BE GREATER OR EQUAL TO "ARRAY_SUBCODES"
    TOTALSIZE       : 17,
    SPLIT           : 18,
    MERGE           : 19,
    CHECK           : 20,
    PACK            : 21,
    UNPACK          : 22,
    GET_FOLDERNAME  : 23
}

var InfoSubcode = {
    SET_ERROR   : 1,
    GET_ERROR   : 2,
    ERRORTEXT   : 3,
    GET_VOLUME  : 4,
    SET_VOLUME  : 5,
    GET_MINUTES : 6,
    SET_MINUTES : 7
}

var SoundSubcode = {
    BREAK   : 0,
    TONE    : 1,
    PLAY    : 2,
    REPEAT  : 3,
    SERVICE : 4
}

var StringSubcode = {
    GET_SIZE            : 1,     // Get string size
    ADD                 : 2,     // Add two strings
    COMPARE             : 3,     // Compare two strings
    DUPLICATE           : 5,     // Duplicate one string to another
    VALUE_TO_STRING     : 6,
    STRING_TO_VALUE     : 7,
    STRIP               : 8,
    NUMBER_TO_STRING    : 9,
    SUB                 : 10,
    VALUE_FORMATTED     : 11,
    NUMBER_FORMATTED    : 12
}

var TstSubcode = {
    TST_OPEN            : 10,    // Must >: "INFO_SUBCODES"
    TST_CLOSE           : 11,
    TST_READ_PINS       : 12,
    TST_WRITE_PINS      : 13,
    TST_READ_ADC        : 14,
    TST_WRITE_UART      : 15,
    TST_READ_UART       : 16,
    TST_ENABLE_UART     : 17,
    TST_DISABLE_UART    : 18,
    TST_ACCU_SWITCH     : 19,
    TST_BOOT_MODE2      : 20,
    TST_POLL_MODE2      : 21,
    TST_CLOSE_MODE2     : 22,
    TST_RAM_CHECK       : 23
}

var Opcode = {
    /*All of the opcodes that are used by the VM.*/
    ERROR               : 0x00,
    NOP                 : 0x01,
    PROGRAM_STOP        : 0x02,
    PROGRAM_START       : 0x03,
    OBJECT_STOP         : 0x04,
    OBJECT_START        : 0x05,
    OBJECT_TRIG         : 0x06,
    OBJECT_WAIT         : 0x07,
    RETURN              : 0x08,
    CALL                : 0x09,
    OBJECT_END          : 0x0A,
    SLEEP               : 0x0B,
    PROGRAM_INFO        : 0x0C,
    LABEL               : 0x0D,
    PROBE               : 0x0E,
    DO                  : 0x0F,
    // MATH
    ADD8                : 0x10,
    ADD16               : 0x11,
    ADD32               : 0x12,
    ADDF                : 0x13,
    SUB8                : 0x14,
    SUB16               : 0x15,
    SUB32               : 0x16,
    SUBF                : 0x17,
    MUL8                : 0x18,
    MUL16               : 0x19,
    MUL32               : 0x1A,
    MULF                : 0x1B,
    DIV8                : 0x1C,
    DIV16               : 0x1D,
    DIV32               : 0x1E,
    DIVF                : 0x1F,
    // LOGIC
    OR8                 : 0x20,
    OR16                : 0x21,
    OR32                : 0x22,
    AND8                : 0x24,
    AND16               : 0x25,
    AND32               : 0x26,
    XOR8                : 0x28,
    XOR16               : 0x29,
    XOR32               : 0x2A,
    RL8                 : 0x2C,
    RL16                : 0x2D,
    RL32                : 0x2E,
    // MOVE
    INIT_BYTES          : 0x2F,
    MOVE8_8             : 0x30,
    MOVE8_16            : 0x31,
    MOVE8_32            : 0x32,
    MOVE8_F             : 0x33,
    MOVE16_8            : 0x34,
    MOVE16_16           : 0x35,
    MOVE16_32           : 0x36,
    MOVE16_F            : 0x37,
    MOVE32_8            : 0x38,
    MOVE32_16           : 0x39,
    MOVE32_32           : 0x3A,
    MOVE32_F            : 0x3B,
    MOVEF_8             : 0x3C,
    MOVEF_16            : 0x3D,
    MOVEF_32            : 0x3E,
    MOVEF_F             : 0x3F,
    // BRANCH
    JR                  : 0x40,
    JR_FALSE            : 0x41,
    JR_TRUE             : 0x42,
    JR_NAN              : 0x43,
    // COMPARE
    CP_LT8              : 0x44,
    CP_LT16             : 0x45,
    CP_LT32             : 0x46,
    CP_LTF              : 0x47,
    CP_GT8              : 0x48,
    CP_GT16             : 0x49,
    CP_GT32             : 0x4A,
    CP_GTF              : 0x4B,
    CP_EQ8              : 0x4C,
    CP_EQ16             : 0x4D,
    CP_EQ32             : 0x4E,
    CP_EQF              : 0x4F,
    CP_NEQ8             : 0x50,
    CP_NEQ16            : 0x51,
    CP_NEQ32            : 0x52,
    CP_NEQF             : 0x53,
    CP_LTEQ8            : 0x54,
    CP_LTEQ16           : 0x55,
    CP_LTEQ32           : 0x56,
    CP_LTEQF            : 0x57,
    CP_GTEQ8            : 0x58,
    CP_GTEQ16           : 0x59,
    CP_GTEQ32           : 0x5A,
    CP_GTEQF            : 0x5B,
    // SELECT
    SELECT8             : 0x5C,
    SELECT16            : 0x5D,
    SELECT32            : 0x5E,
    SELECTF             : 0x5F,
    SYSTEM              : 0x60,
    PORT_CNV_OUTPUT     : 0x61,
    PORT_CNV_INPUT      : 0x62,
    NOTE_TO_FREQ        : 0x63,
    // BRANCH
    JR_LT8              : 0x64,
    JR_LT16             : 0x65,
    JR_LT32             : 0x66,
    JR_LTF              : 0x67,
    JR_GT8              : 0x68,
    JR_GT16             : 0x69,
    JR_GT32             : 0x6A,
    JR_GTF              : 0x6B,
    JR_EQ8              : 0x6C,
    JR_EQ16             : 0x6D,
    JR_EQ32             : 0x6E,
    JR_EQF              : 0x6F,
    JR_NEQ8             : 0x70,
    JR_NEQ16            : 0x71,
    JR_NEQ32            : 0x72,
    JR_NEQF             : 0x73,
    JR_LTEQ8            : 0x74,
    JR_LTEQ16           : 0x75,
    JR_LTEQ32           : 0x76,
    JR_LTEQF            : 0x77,
    JR_GTEQ8            : 0x78,
    JR_GTEQ16           : 0x79,
    JR_GTEQ32           : 0x7A,
    JR_GTEQF            : 0x7B,
    // VM
    INFO                : 0x7C,
    STRINGS             : 0x7D,
    MEMORY_WRITE        : 0x7E,
    MEMORY_READ         : 0x7F,
    // UI
    UI_FLUSH            : 0x80,
    UI_READ             : 0x81,
    UI_WRITE            : 0x82,
    UI_BUTTON           : 0x83,
    UI_DRAW             : 0x84,
    // TIMER
    TIMER_WAIT          : 0x85,
    TIMER_READY         : 0x86,
    TIMER_READ          : 0x87,
    // BREAKPOINT
    BP0                 : 0x88,
    BP1                 : 0x89,
    BP2                 : 0x8A,
    BP3                 : 0x8B,
    BP_SET              : 0x8C,
    MATH                : 0x8D,
    RANDOM              : 0x8E,
    // TIMER
    TIMER_READ_US       : 0x8F,
    // UI
    KEEP_ALIVE          : 0x90,
    // COM
    COM_READ            : 0x91,
    COM_WRITE           : 0x92,
    // SOUND
    SOUND               : 0x94,
    SOUND_TEST          : 0x95,
    SOUND_READY         : 0x96,
    // INPUT
    INPUT_SAMPLE        : 0x97,
    INPUT_DEVICE_LIST   : 0x98,
    INPUT_DEVICE        : 0x99,
    INPUT_READ          : 0x9A,
    INPUT_TEST          : 0x9B,
    INPUT_READY         : 0x9C,
    INPUT_READSI        : 0x9D,
    INPUT_READEXT       : 0x9E,
    INPUT_WRITE         : 0x9F,
    // OUTPUT
    OUTPUT_GET_TYPE     : 0xA0,
    OUTPUT_SET_TYPE     : 0xA1,
    OUTPUT_RESET        : 0xA2,
    OUTPUT_STOP         : 0xA3,
    OUTPUT_POWER        : 0xA4,
    OUTPUT_SPEED        : 0xA5,
    OUTPUT_START        : 0xA6,
    OUTPUT_POLARITY     : 0xA7,
    OUTPUT_READ         : 0xA8,
    OUTPUT_TEST         : 0xA9,
    OUTPUT_READY        : 0xAA,
    OUTPUT_POSITION     : 0xAB,
    OUTPUT_STEP_POWER   : 0xAC,
    OUTPUT_TIME_POWER   : 0xAD,
    OUTPUT_STEP_SPEED   : 0xAE,
    OUTPUT_TIME_SPEED   : 0xAF,
    OUTPUT_STEP_SYNC    : 0xB0,
    OUTPUT_TIME_SYNC    : 0xB1,
    OUTPUT_CLR_COUNT    : 0xB2,
    OUTPUT_GET_COUNT    : 0xB3,
    OUTPUT_PRG_STOP     : 0xB4,
    // MEMORY
    FILE                : 0xC0,
    ARRAY               : 0xC1,
    ARRAY_WRITE         : 0xC2,
    ARRAY_READ          : 0xC3,
    ARRAY_APPEND        : 0xC4,
    MEMORY_USAGE        : 0xC5,
    FILENAME            : 0xC6,
    // READ
    READ8               : 0xC8,
    READ16              : 0xC9,
    READ32              : 0xCA,
    READF               : 0xCB,
    // WRITE
    WRITE8              : 0xCC,
    WRITE16             : 0xCD,
    WRITE32             : 0xCE,
    WRITEF              : 0xCF,
    // COM
    COM_READY           : 0xD0,
    COM_READDATA        : 0xD1,
    COM_WRITEDATA       : 0xD2,
    COM_GET             : 0xD3,
    COM_SET             : 0xD4,
    COM_TEST            : 0xD5,
    COM_REMOVE          : 0xD6,
    COM_WRITEFILE       : 0xD7,
    MAILBOX_OPEN        : 0xD8,
    MAILBOX_WRITE       : 0xD9,
    MAILBOX_READ        : 0xDA,
    MAILBOX_TEST        : 0xDB,
    MAILBOX_READY       : 0xDC,
    MAILBOX_CLOSE       : 0xDD,
    // SPARE
    TST                 : 0xFF
}




module.exports = {
  MAX_CMD_LEN: MAX_CMD_LEN,
  MAX_STR_LEN: MAX_STR_LEN,
  MAX_VERSION_STR_LEN: MAX_VERSION_STR_LEN,
  MAX_LOCAL_VARIABLE_BYTES: MAX_LOCAL_VARIABLE_BYTES,
  MAX_NAME_STR_LEN: MAX_NAME_STR_LEN,
  MOTOR_MIN_POWER: MOTOR_MIN_POWER,
  MOTOR_MAX_POWER: MOTOR_MAX_POWER,
  MOTOR_MIN_SPEED: MOTOR_MIN_SPEED,
  MOTOR_MAX_SPEED: MOTOR_MAX_SPEED,
  USB_CHAIN_LAYER_MASTER: USB_CHAIN_LAYER_MASTER,
  USB_CHAIN_LAYER_SLAVE: USB_CHAIN_LAYER_SLAVE,
  MOTOR_MIN_RATIO: MOTOR_MIN_RATIO,
  MOTOR_MAX_RATIO: MOTOR_MAX_RATIO,
  MIN_VOLUME: MIN_VOLUME,
  MAX_VOLUME: MAX_VOLUME,
  LCD_HEIGHT_PIXELS: LCD_HEIGHT_PIXELS,
  LCD_WIDTH_PIXELS: LCD_WIDTH_PIXELS,
  CommandType: CommandType,
  ReplyType: ReplyType,
  OutputPort: OutputPort,
  InputPort: InputPort,
  StopType: StopType,
  PolarityType: PolarityType,
  TouchMode: TouchMode,
  NXTLightMode: NXTLightMode,
  NXTSoundMode: NXTSoundMode,
  NXTColorMode: NXTColorMode,
  NXTUltrasonicMode: NXTUltrasonicMode,
  NXTTemperatureMode: NXTTemperatureMode,
  MotorMode: MotorMode,
  UltrasonicMode: UltrasonicMode,
  GyroMode: GyroMode,
  IRMode: IRMode,
  ColorMode: ColorMode,
  ColorSensorColor: ColorSensorColor,
  LEDPattern: LEDPattern,
  DeviceType: DeviceType,
  LCDColor: LCDColor,
  ButtonType: ButtonType,
  MathType: MathType,
  BrowserType: BrowserType,
  Icon: Icon,
  FontType: FontType,
  DataFormat: DataFormat,
  ParamType: ParamType,
  PARAM_TYPE_LENS: PARAM_TYPE_LENS,
  DATA_FORMAT_LENS: DATA_FORMAT_LENS,
  OUTPUT_CHANNEL_TO_INDEX: OUTPUT_CHANNEL_TO_INDEX,
  UIReadSubcode: UIReadSubcode,
  UIWriteSubcode: UIWriteSubcode,
  UIButtonSubcode: UIButtonSubcode,
  COMGetSubcodes: COMGetSubcodes,
  COMSetSubcode: COMSetSubcode,
  InputDeviceSubcode: InputDeviceSubcode,
  ProgramInfoSubcode: ProgramInfoSubcode,
  UIDrawSubcode: UIDrawSubcode,
  FileSubcode: FileSubcode,
  ArraySubcode: ArraySubcode,
  FilenameSubcode: FilenameSubcode,
  InfoSubcode: InfoSubcode,
  SoundSubcode: SoundSubcode,
  StringSubcode: StringSubcode,
  TstSubcode: TstSubcode,
  Opcode: Opcode
}