let createRoomConfigs = {
  "roles": [
    {
      "role": "host",
      "publish": {
        "video": true,
        "audio": true
      },
      "subscribe": {
        "video": true,
        "audio": true
      }
    },
    {
      "role": "guest",
      "publish": {
        "video": true,
        "audio": true
      },
      "subscribe": {
        "video": true,
        "audio": true
      }
    }
  ],
  "views": [
    {
      "label": "common",
    },
    {
      "label": "main",
    },
    {
      "label": "sub",
    },
  ],
};

//--------------------------------------------------------------------------------
// 640x320_bitrate100
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
// 640x320_bitrate100
let createRoomConfigs1 = {
  "mediaIn": {
    "audio": [
      {
        "codec": "opus",
        "sampleRate": 48000,
        "channelNum": 2
      },
      {
        "codec": "isac",
        "sampleRate": 16000
      },
      {
        "codec": "isac",
        "sampleRate": 32000
      },
      {
        "codec": "g722",
        "sampleRate": 16000,
        "channelNum": 1
      },
      {
        "codec": "pcma"
      },
      {
        "codec": "pcmu"
      },
      {
        "codec": "aac"
      },
      {
        "codec": "ac3"
      },
      {
        "codec": "nellymoser"
      },
      {
        "codec": "ilbc"
      }
    ],
    "video": [
      {
        "codec": "h264"
      },
      {
        "codec": "vp8"
      },
      {
        "codec": "vp9"
      }
    ]
  },
  "mediaOut": {
    "video": {
      "parameters": {
        "resolution": [
          "x3/4",
          "x2/3",
          "x1/2",
          "x1/3",
          "x1/4",
          "hd1080p",
          "hd720p",
          "svga",
          "vga",
          "qvga",
          "cif"
        ],
        "framerate": [
          6,
          12,
          15,
          24,
          30,
          48,
          60
        ],
        "bitrate": [
          "x0.8",
          "x0.6",
          "x0.4",
          "x0.2"
        ],
        "keyFrameInterval": [
          100,
          30,
          5,
          2,
          1
        ]
      },
      "format": [
        {
          "codec": "vp8"
        },
        {
          "codec": "h264",
          "profile": "CB"
        },
        {
          "codec": "h264",
          "profile": "B"
        },
        {
          "codec": "vp9"
        }
      ]
    },
    "audio": [
      {
        "codec": "opus",
        "sampleRate": 48000,
        "channelNum": 2
      },
      {
        "codec": "isac",
        "sampleRate": 16000
      },
      {
        "codec": "isac",
        "sampleRate": 32000
      },
      {
        "codec": "g722",
        "sampleRate": 16000,
        "channelNum": 1
      },
      {
        "codec": "pcma"
      },
      {
        "codec": "pcmu"
      },
      {
        "codec": "aac",
        "sampleRate": 48000,
        "channelNum": 2
      },
      {
        "codec": "ac3"
      },
      {
        "codec": "nellymoser"
      },
      {
        "codec": "ilbc"
      }
    ]
  },
  "transcoding": {
    "video": {
      "parameters": {
        "resolution": true,
        "framerate": true,
        "bitrate": true,
        "keyFrameInterval": true
      },
      "format": true
    },
    "audio": true
  },
  "notifying": {
    "participantActivities": true,
    "streamChange": true
  },
  "inputLimit": -1,
  "participantLimit": -1,
  "roles": [
    {
      "role": "host",
      "publish": {
        "video": true,
        "audio": true
      },
      "subscribe": {
        "video": true,
        "audio": true
      }
    },
    {
      "role": "guest",
      "publish": {
        "video": true,
        "audio": true
      },
      "subscribe": {
        "video": true,
        "audio": true
      }
    }
  ],
  "views": [
    {
      "label": "main",
      "video": {
        "parameters": {
          "resolution": {
            "width": 640,
            "height": 360
          },
          "framerate": 12,
          "bitrate": 100,
          "keyFrameInterval": 100
            },
        "bgColor": {
          "r": 0,
          "g": 0,
          "b": 0
        },
        "layout": {
          "templates": {
            "base": "fluid",
            "custom": []
          },
          "fitPolicy": "letterbox"
        },
        "format": {
          "codec": "vp8"
        },
        "maxInput": 16,
        "motionFactor": 0.8,
        "keepActiveInputPrimary": false
      },
      "audio": {
        "format": {
          "codec": "opus",
          "sampleRate": 48000,
          "channelNum": 2
        },
        "vad": true
      },
    },
    {
      "label": "sub",
      "video": {
        "parameters": {
          "resolution": {
            "width": 640,
            "height": 360
          },
          "framerate": 12,
          "bitrate": 100,
          "keyFrameInterval": 100
            },
        "bgColor": {
          "r": 0,
          "g": 0,
          "b": 0
        },
        "layout": {
          "templates": {
            "base": "fluid",
            "custom": []
          },
          "fitPolicy": "letterbox"
        },
        "format": {
          "codec": "vp8"
        },
        "maxInput": 16,
        "motionFactor": 0.8,
        "keepActiveInputPrimary": false
      },
      "audio": {
        "format": {
          "codec": "opus",
          "sampleRate": 48000,
          "channelNum": 2
        },
        "vad": true
      },
    }
  ],
};

//--------------------------------------------------------------------------------
// 640x320_bitrate400
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
let createRoomConfigs2 = {
  "mediaIn": {
    "audio": [
      {
        "codec": "opus",
        "sampleRate": 48000,
        "channelNum": 2
      },
      {
        "codec": "isac",
        "sampleRate": 16000
      },
      {
        "codec": "isac",
        "sampleRate": 32000
      },
      {
        "codec": "g722",
        "sampleRate": 16000,
        "channelNum": 1
      },
      {
        "codec": "pcma"
      },
      {
        "codec": "pcmu"
      },
      {
        "codec": "aac"
      },
      {
        "codec": "ac3"
      },
      {
        "codec": "nellymoser"
      },
      {
        "codec": "ilbc"
      }
    ],
    "video": [
      {
        "codec": "h264"
      },
      {
        "codec": "vp8"
      },
      {
        "codec": "vp9"
      }
    ]
  },
  "mediaOut": {
    "video": {
      "parameters": {
        "resolution": [
          "x3/4",
          "x2/3",
          "x1/2",
          "x1/3",
          "x1/4",
          "hd1080p",
          "hd720p",
          "svga",
          "vga",
          "qvga",
          "cif"
        ],
        "framerate": [
          6,
          12,
          15,
          24,
          30,
          48,
          60
        ],
        "bitrate": [
          "x0.8",
          "x0.6",
          "x0.4",
          "x0.2"
        ],
        "keyFrameInterval": [
          100,
          30,
          5,
          2,
          1
        ]
      },
      "format": [
        {
          "codec": "vp8"
        },
        {
          "codec": "h264",
          "profile": "CB"
        },
        {
          "codec": "h264",
          "profile": "B"
        },
        {
          "codec": "vp9"
        }
      ]
    },
    "audio": [
      {
        "codec": "opus",
        "sampleRate": 48000,
        "channelNum": 2
      },
      {
        "codec": "isac",
        "sampleRate": 16000
      },
      {
        "codec": "isac",
        "sampleRate": 32000
      },
      {
        "codec": "g722",
        "sampleRate": 16000,
        "channelNum": 1
      },
      {
        "codec": "pcma"
      },
      {
        "codec": "pcmu"
      },
      {
        "codec": "aac",
        "sampleRate": 48000,
        "channelNum": 2
      },
      {
        "codec": "ac3"
      },
      {
        "codec": "nellymoser"
      },
      {
        "codec": "ilbc"
      }
    ]
  },
  "transcoding": {
    "video": {
      "parameters": {
        "resolution": true,
        "framerate": true,
        "bitrate": true,
        "keyFrameInterval": true
      },
      "format": true
    },
    "audio": true
  },
  "notifying": {
    "participantActivities": true,
    "streamChange": true
  },
  "inputLimit": -1,
  "participantLimit": -1,
  "roles": [
    {
      "role": "host",
      "publish": {
        "video": true,
        "audio": true
      },
      "subscribe": {
        "video": true,
        "audio": true
      }
    },
    {
      "role": "guest",
      "publish": {
        "video": true,
        "audio": true
      },
      "subscribe": {
        "video": true,
        "audio": true
      }
    }
  ],
  "views": [
    {
      "label": "main",
      "video": {
        "parameters": {
          "resolution": {
            "width": 640,
            "height": 360
          },
          "framerate": 12,
          "bitrate": 400,
          "keyFrameInterval": 100
            },
        "bgColor": {
          "r": 0,
          "g": 0,
          "b": 0
        },
        "layout": {
          "templates": {
            "base": "fluid",
            "custom": []
          },
          "fitPolicy": "letterbox"
        },
        "format": {
          "codec": "vp8"
        },
        "maxInput": 16,
        "motionFactor": 0.8,
        "keepActiveInputPrimary": false
      },
      "audio": {
        "format": {
          "codec": "opus",
          "sampleRate": 48000,
          "channelNum": 2
        },
        "vad": true
      },
    },
    {
      "label": "sub",
      "video": {
        "parameters": {
          "resolution": {
            "width": 640,
            "height": 360
          },
          "framerate": 12,
          "bitrate": 400,
          "keyFrameInterval": 100
            },
        "bgColor": {
          "r": 0,
          "g": 0,
          "b": 0
        },
        "layout": {
          "templates": {
            "base": "fluid",
            "custom": []
          },
          "fitPolicy": "letterbox"
        },
        "format": {
          "codec": "vp8"
        },
        "maxInput": 16,
        "motionFactor": 0.8,
        "keepActiveInputPrimary": false
      },
      "audio": {
        "format": {
          "codec": "opus",
          "sampleRate": 48000,
          "channelNum": 2
        },
        "vad": true
      },
    }
  ],
};

//--------------------------------------------------------------------------------
// 320x160_bitrate100
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
let createRoomConfigs3 = {
  "mediaIn": {
    "audio": [
      {
        "codec": "opus",
        "sampleRate": 48000,
        "channelNum": 2
      },
      {
        "codec": "isac",
        "sampleRate": 16000
      },
      {
        "codec": "isac",
        "sampleRate": 32000
      },
      {
        "codec": "g722",
        "sampleRate": 16000,
        "channelNum": 1
      },
      {
        "codec": "pcma"
      },
      {
        "codec": "pcmu"
      },
      {
        "codec": "aac"
      },
      {
        "codec": "ac3"
      },
      {
        "codec": "nellymoser"
      },
      {
        "codec": "ilbc"
      }
    ],
    "video": [
      {
        "codec": "h264"
      },
      {
        "codec": "vp8"
      },
      {
        "codec": "vp9"
      }
    ]
  },
  "mediaOut": {
    "video": {
      "parameters": {
        "resolution": [
          "x3/4",
          "x2/3",
          "x1/2",
          "x1/3",
          "x1/4",
          "hd1080p",
          "hd720p",
          "svga",
          "vga",
          "qvga",
          "cif"
        ],
        "framerate": [
          6,
          12,
          15,
          24,
          30,
          48,
          60
        ],
        "bitrate": [
          "x0.8",
          "x0.6",
          "x0.4",
          "x0.2"
        ],
        "keyFrameInterval": [
          100,
          30,
          5,
          2,
          1
        ]
      },
      "format": [
        {
          "codec": "vp8"
        },
        {
          "codec": "h264",
          "profile": "CB"
        },
        {
          "codec": "h264",
          "profile": "B"
        },
        {
          "codec": "vp9"
        }
      ]
    },
    "audio": [
      {
        "codec": "opus",
        "sampleRate": 48000,
        "channelNum": 2
      },
      {
        "codec": "isac",
        "sampleRate": 16000
      },
      {
        "codec": "isac",
        "sampleRate": 32000
      },
      {
        "codec": "g722",
        "sampleRate": 16000,
        "channelNum": 1
      },
      {
        "codec": "pcma"
      },
      {
        "codec": "pcmu"
      },
      {
        "codec": "aac",
        "sampleRate": 48000,
        "channelNum": 2
      },
      {
        "codec": "ac3"
      },
      {
        "codec": "nellymoser"
      },
      {
        "codec": "ilbc"
      }
    ]
  },
  "transcoding": {
    "video": {
      "parameters": {
        "resolution": true,
        "framerate": true,
        "bitrate": true,
        "keyFrameInterval": true
      },
      "format": true
    },
    "audio": true
  },
  "notifying": {
    "participantActivities": true,
    "streamChange": true
  },
  "inputLimit": -1,
  "participantLimit": -1,
  "roles": [
    {
      "role": "host",
      "publish": {
        "video": true,
        "audio": true
      },
      "subscribe": {
        "video": true,
        "audio": true
      }
    },
    {
      "role": "guest",
      "publish": {
        "video": true,
        "audio": true
      },
      "subscribe": {
        "video": true,
        "audio": true
      }
    }
  ],
  "views": [
    {
      "label": "main",
      "video": {
        "parameters": {
          "resolution": {
            "width": 320,
            "height": 180
          },
          "framerate": 12,
          "bitrate": 100,
          "keyFrameInterval": 100
            },
        "bgColor": {
          "r": 0,
          "g": 0,
          "b": 0
        },
        "layout": {
          "templates": {
            "base": "fluid",
            "custom": []
          },
          "fitPolicy": "letterbox"
        },
        "format": {
          "codec": "vp8"
        },
        "maxInput": 16,
        "motionFactor": 0.8,
        "keepActiveInputPrimary": false
      },
      "audio": {
        "format": {
          "codec": "opus",
          "sampleRate": 48000,
          "channelNum": 2
        },
        "vad": true
      },
    },
    {
      "label": "sub",
      "video": {
        "parameters": {
          "resolution": {
            "width": 320,
            "height": 180
          },
          "framerate": 12,
          "bitrate": 100,
          "keyFrameInterval": 100
            },
        "bgColor": {
          "r": 0,
          "g": 0,
          "b": 0
        },
        "layout": {
          "templates": {
            "base": "fluid",
            "custom": []
          },
          "fitPolicy": "letterbox"
        },
        "format": {
          "codec": "vp8"
        },
        "maxInput": 16,
        "motionFactor": 0.8,
        "keepActiveInputPrimary": false
      },
      "audio": {
        "format": {
          "codec": "opus",
          "sampleRate": 48000,
          "channelNum": 2
        },
        "vad": true
      },
    }
  ],
};

//--------------------------------------------------------------------------------
// 320x160_bitrate400
//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
let createRoomConfigs4 = {
  "mediaIn": {
    "audio": [
      {
        "codec": "opus",
        "sampleRate": 48000,
        "channelNum": 2
      },
      {
        "codec": "isac",
        "sampleRate": 16000
      },
      {
        "codec": "isac",
        "sampleRate": 32000
      },
      {
        "codec": "g722",
        "sampleRate": 16000,
        "channelNum": 1
      },
      {
        "codec": "pcma"
      },
      {
        "codec": "pcmu"
      },
      {
        "codec": "aac"
      },
      {
        "codec": "ac3"
      },
      {
        "codec": "nellymoser"
      },
      {
        "codec": "ilbc"
      }
    ],
    "video": [
      {
        "codec": "h264"
      },
      {
        "codec": "vp8"
      },
      {
        "codec": "vp9"
      }
    ]
  },
  "mediaOut": {
    "video": {
      "parameters": {
        "resolution": [
          "x3/4",
          "x2/3",
          "x1/2",
          "x1/3",
          "x1/4",
          "hd1080p",
          "hd720p",
          "svga",
          "vga",
          "qvga",
          "cif"
        ],
        "framerate": [
          6,
          12,
          15,
          24,
          30,
          48,
          60
        ],
        "bitrate": [
          "x0.8",
          "x0.6",
          "x0.4",
          "x0.2"
        ],
        "keyFrameInterval": [
          100,
          30,
          5,
          2,
          1
        ]
      },
      "format": [
        {
          "codec": "vp8"
        },
        {
          "codec": "h264",
          "profile": "CB"
        },
        {
          "codec": "h264",
          "profile": "B"
        },
        {
          "codec": "vp9"
        }
      ]
    },
    "audio": [
      {
        "codec": "opus",
        "sampleRate": 48000,
        "channelNum": 2
      },
      {
        "codec": "isac",
        "sampleRate": 16000
      },
      {
        "codec": "isac",
        "sampleRate": 32000
      },
      {
        "codec": "g722",
        "sampleRate": 16000,
        "channelNum": 1
      },
      {
        "codec": "pcma"
      },
      {
        "codec": "pcmu"
      },
      {
        "codec": "aac",
        "sampleRate": 48000,
        "channelNum": 2
      },
      {
        "codec": "ac3"
      },
      {
        "codec": "nellymoser"
      },
      {
        "codec": "ilbc"
      }
    ]
  },
  "transcoding": {
    "video": {
      "parameters": {
        "resolution": true,
        "framerate": true,
        "bitrate": true,
        "keyFrameInterval": true
      },
      "format": true
    },
    "audio": true
  },
  "notifying": {
    "participantActivities": true,
    "streamChange": true
  },
  "inputLimit": -1,
  "participantLimit": -1,
  "roles": [
    {
      "role": "host",
      "publish": {
        "video": true,
        "audio": true
      },
      "subscribe": {
        "video": true,
        "audio": true
      }
    },
    {
      "role": "guest",
      "publish": {
        "video": true,
        "audio": true
      },
      "subscribe": {
        "video": true,
        "audio": true
      }
    }
  ],
  "views": [
    {
      "label": "main",
      "video": {
        "parameters": {
          "resolution": {
            "width": 320,
            "height": 180
          },
          "framerate": 12,
          "bitrate": 400,
          "keyFrameInterval": 100
            },
        "bgColor": {
          "r": 0,
          "g": 0,
          "b": 0
        },
        "layout": {
          "templates": {
            "base": "fluid",
            "custom": []
          },
          "fitPolicy": "letterbox"
        },
        "format": {
          "codec": "vp8"
        },
        "maxInput": 16,
        "motionFactor": 0.8,
        "keepActiveInputPrimary": false
      },
      "audio": {
        "format": {
          "codec": "opus",
          "sampleRate": 48000,
          "channelNum": 2
        },
        "vad": true
      },
    },
    {
      "label": "sub",
      "video": {
        "parameters": {
          "resolution": {
            "width": 320,
            "height": 180
          },
          "framerate": 12,
          "bitrate": 400,
          "keyFrameInterval": 100
            },
        "bgColor": {
          "r": 0,
          "g": 0,
          "b": 0
        },
        "layout": {
          "templates": {
            "base": "fluid",
            "custom": []
          },
          "fitPolicy": "letterbox"
        },
        "format": {
          "codec": "vp8"
        },
        "maxInput": 16,
        "motionFactor": 0.8,
        "keepActiveInputPrimary": false
      },
      "audio": {
        "format": {
          "codec": "opus",
          "sampleRate": 48000,
          "channelNum": 2
        },
        "vad": true
      },
    }
  ],
};
