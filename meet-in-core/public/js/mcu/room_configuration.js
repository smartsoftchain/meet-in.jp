//---------------------------------------
// カメラ映像＆音声ルーム
//---------------------------------------
let roomConfigs = {
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
        "bgColor": { r: 255, g: 250, b: 240 },
        "parameters": {
          "resolution": {
            "width": 640,
            "height": 480
          },
          "framerate": 12,
          "keyFrameInterval": 100
        },
        "maxInput": 1,
      },
    },
  ],
};

//---------------------------------------
// 画面共有ルーム用
//---------------------------------------
let roomConfigsSharescreen = {
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
        "bgColor": { r: 255, g: 250, b: 240 },
        "parameters": {
          "resolution": {
            "width": 640,
            "height": 480
          },
          "framerate": 12,
          "keyFrameInterval": 100
        },
        "maxInput": 1,
      },
    },
  ],
};


//---------------------------------------
// 横一列映像用
//---------------------------------------
let roomConfigsForHorizontalRow = {
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
        "bgColor": { r: 255, g: 250, b: 240 },
        "parameters": {
          "resolution": {
            "width": 1280,
            "height": 100
          },
          "framerate": 12,
          "keyFrameInterval": 100
        },
        "layout": {
          "templates": {
            "base": "fluid",
"custom": [
  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "4/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      }
    ]
  },

  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "4/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "2",
        "shape": "rectangle",
        "area": {
            "left": "5/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      }
    ]
  },

  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "3/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "2",
        "shape": "rectangle",
        "area": {
            "left": "4/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "3",
        "shape": "rectangle",
        "area": {
            "left": "5/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      }
    ]
  },

  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "3/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "2",
        "shape": "rectangle",
        "area": {
            "left": "4/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "3",
        "shape": "rectangle",
        "area": {
            "left": "5/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "4",
        "shape": "rectangle",
        "area": {
            "left": "6/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      }
    ]
  },

  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "2/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "2",
        "shape": "rectangle",
        "area": {
            "left": "3/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "3",
        "shape": "rectangle",
        "area": {
            "left": "4/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "4",
        "shape": "rectangle",
        "area": {
            "left": "5/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "5",
        "shape": "rectangle",
        "area": {
            "left": "6/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      }
    ]
  },

  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "2/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "2",
        "shape": "rectangle",
        "area": {
            "left": "3/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "3",
        "shape": "rectangle",
        "area": {
            "left": "4/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "4",
        "shape": "rectangle",
        "area": {
            "left": "5/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "5",
        "shape": "rectangle",
        "area": {
            "left": "6/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "6",
        "shape": "rectangle",
        "area": {
            "left": "7/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      }
    ]
  },

  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "1/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "2",
        "shape": "rectangle",
        "area": {
            "left": "2/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "3",
        "shape": "rectangle",
        "area": {
            "left": "3/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "4",
        "shape": "rectangle",
        "area": {
            "left": "4/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "5",
        "shape": "rectangle",
        "area": {
            "left": "5/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "6",
        "shape": "rectangle",
        "area": {
            "left": "6/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "7",
        "shape": "rectangle",
        "area": {
            "left": "7/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      }
    ]
  },

  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "1/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "2",
        "shape": "rectangle",
        "area": {
            "left": "2/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "3",
        "shape": "rectangle",
        "area": {
            "left": "3/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "4",
        "shape": "rectangle",
        "area": {
            "left": "4/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "5",
        "shape": "rectangle",
        "area": {
            "left": "5/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "6",
        "shape": "rectangle",
        "area": {
            "left": "6/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "7",
        "shape": "rectangle",
        "area": {
            "left": "7/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "8",
        "shape": "rectangle",
        "area": {
            "left": "8/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      }
    ]
  },

  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "1/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "2",
        "shape": "rectangle",
        "area": {
            "left": "1/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "3",
        "shape": "rectangle",
        "area": {
            "left": "2/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "4",
        "shape": "rectangle",
        "area": {
            "left": "3/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "5",
        "shape": "rectangle",
        "area": {
            "left": "4/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "6",
        "shape": "rectangle",
        "area": {
            "left": "5/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "7",
        "shape": "rectangle",
        "area": {
            "left": "6/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "8",
        "shape": "rectangle",
        "area": {
            "left": "7/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "9",
        "shape": "rectangle",
        "area": {
            "left": "8/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      }
    ]
  },

  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "2",
        "shape": "rectangle",
        "area": {
            "left": "1/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "3",
        "shape": "rectangle",
        "area": {
            "left": "2/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "4",
        "shape": "rectangle",
        "area": {
            "left": "3/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "5",
        "shape": "rectangle",
        "area": {
            "left": "4/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "6",
        "shape": "rectangle",
        "area": {
            "left": "5/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "7",
        "shape": "rectangle",
        "area": {
            "left": "6/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "8",
        "shape": "rectangle",
        "area": {
            "left": "7/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "9",
        "shape": "rectangle",
        "area": {
            "left": "8/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      },
      {
        "id": "10",
        "shape": "rectangle",
        "area": {
            "left": "9/10",
            "top": "0",
            "width": "1/10",
            "height": "1"
        }
      }
    ]
  }

          ]
          },
          "fitPolicy": "letterbox"
        },
        "maxInput": 10,
      },
    }
  ],
};

//---------------------------------------
// ゲスト映像用
//---------------------------------------
let roomConfigsForSubscriberThumbnail = {
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
        "bgColor": { r: 255, g: 250, b: 240 },
        "parameters": {
          "resolution": {
            "width": 900,
            "height": 450
          },
          "framerate": 12,
          "keyFrameInterval": 100
        },
        "layout": {
          "templates": {
            "base": "fluid",
            "custom": [
  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "0",
            "width": "1",
            "height": "1"
        }
      }
    ]
  },

  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "0",
            "width": "1/2",
            "height": "1"
        }
      },
      {
        "id": "2",
        "shape": "rectangle",
        "area": {
            "left": "1/2",
            "top": "0",
            "width": "1/2",
            "height": "1"
        }
      }
    ]
  },

  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "0",
            "width": "1/2",
            "height": "1/2"
        }
      },
      {
        "id": "2",
        "shape": "rectangle",
        "area": {
            "left": "1/2",
            "top": "0",
            "width": "1/2",
            "height": "1/2"
        }
      },
      {
        "id": "3",
        "shape": "rectangle",
        "area": {
            "left": "1/4",
            "top": "1/2",
            "width": "1/2",
            "height": "1/2"
        }
      }
    ]
  },

  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "0",
            "width": "1/2",
            "height": "1/2"
        }
      },
      {
        "id": "2",
        "shape": "rectangle",
        "area": {
            "left": "1/2",
            "top": "0",
            "width": "1/2",
            "height": "1/2"
        }
      },
      {
        "id": "3",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "1/2",
            "width": "1/2",
            "height": "1/2"
        }
      },
      {
        "id": "4",
        "shape": "rectangle",
        "area": {
            "left": "1/2",
            "top": "1/2",
            "width": "1/2",
            "height": "1/2"
        }
      }
    ]
  },

  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "0",
            "width": "1/3",
            "height": "1/2"
        }
      },
      {
        "id": "2",
        "shape": "rectangle",
        "area": {
            "left": "1/3",
            "top": "0",
            "width": "1/3",
            "height": "1/2"
        }
      },
      {
        "id": "3",
        "shape": "rectangle",
        "area": {
            "left": "2/3",
            "top": "0",
            "width": "1/3",
            "height": "1/2"
        }
      },
      {
        "id": "4",
        "shape": "rectangle",
        "area": {
            "left": "1/6",
            "top": "1/2",
            "width": "1/3",
            "height": "1/2"
        }
      },
      {
        "id": "5",
        "shape": "rectangle",
        "area": {
            "left": "3/6",
            "top": "1/2",
            "width": "1/3",
            "height": "1/2"
        }
      }
    ]
  },

  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "0",
            "width": "1/3",
            "height": "1/2"
        }
      },
      {
        "id": "2",
        "shape": "rectangle",
        "area": {
            "left": "1/3",
            "top": "0",
            "width": "1/3",
            "height": "1/2"
        }
      },
      {
        "id": "3",
        "shape": "rectangle",
        "area": {
            "left": "2/3",
            "top": "0",
            "width": "1/3",
            "height": "1/2"
        }
      },
      {
        "id": "4",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "1/2",
            "width": "1/3",
            "height": "1/2"
        }
      },
      {
        "id": "5",
        "shape": "rectangle",
        "area": {
            "left": "1/3",
            "top": "1/2",
            "width": "1/3",
            "height": "1/2"
        }
      },
      {
        "id": "6",
        "shape": "rectangle",
        "area": {
            "left": "2/3",
            "top": "1/2",
            "width": "1/3",
            "height": "1/2"
        }
      }
    ]
  },

  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "0",
            "width": "1/3",
            "height": "1/3"
        }
      },
      {
        "id": "2",
        "shape": "rectangle",
        "area": {
            "left": "1/3",
            "top": "0",
            "width": "1/3",
            "height": "1/3"
        }
      },
      {
        "id": "3",
        "shape": "rectangle",
        "area": {
            "left": "2/3",
            "top": "0",
            "width": "1/3",
            "height": "1/3"
        }
      },
      {
        "id": "4",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "1/3",
            "width": "1/3",
            "height": "1/3"
        }
      },
      {
        "id": "5",
        "shape": "rectangle",
        "area": {
            "left": "1/3",
            "top": "1/3",
            "width": "1/3",
            "height": "1/3"
        }
      },
      {
        "id": "6",
        "shape": "rectangle",
        "area": {
            "left": "2/3",
            "top": "1/3",
            "width": "1/3",
            "height": "1/3"
        }
      },
      {
        "id": "7",
        "shape": "rectangle",
        "area": {
            "left": "1/3",
            "top": "2/3",
            "width": "1/3",
            "height": "1/3"
        }
      }
    ]
  },

  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "0",
            "width": "1/3",
            "height": "1/3"
        }
      },
      {
        "id": "2",
        "shape": "rectangle",
        "area": {
            "left": "1/3",
            "top": "0",
            "width": "1/3",
            "height": "1/3"
        }
      },
      {
        "id": "3",
        "shape": "rectangle",
        "area": {
            "left": "2/3",
            "top": "0",
            "width": "1/3",
            "height": "1/3"
        }
      },
      {
        "id": "4",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "1/3",
            "width": "1/3",
            "height": "1/3"
        }
      },
      {
        "id": "5",
        "shape": "rectangle",
        "area": {
            "left": "1/3",
            "top": "1/3",
            "width": "1/3",
            "height": "1/3"
        }
      },
      {
        "id": "6",
        "shape": "rectangle",
        "area": {
            "left": "2/3",
            "top": "1/3",
            "width": "1/3",
            "height": "1/3"
        }
      },
      {
        "id": "7",
        "shape": "rectangle",
        "area": {
            "left": "1/6",
            "top": "2/3",
            "width": "1/3",
            "height": "1/3"
        }
      },
      {
        "id": "8",
        "shape": "rectangle",
        "area": {
            "left": "3/6",
            "top": "2/3",
            "width": "1/3",
            "height": "1/3"
        }
      }
    ]
  },

  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "0",
            "width": "1/3",
            "height": "1/3"
        }
      },
      {
        "id": "2",
        "shape": "rectangle",
        "area": {
            "left": "1/3",
            "top": "0",
            "width": "1/3",
            "height": "1/3"
        }
      },
      {
        "id": "3",
        "shape": "rectangle",
        "area": {
            "left": "2/3",
            "top": "0",
            "width": "1/3",
            "height": "1/3"
        }
      },
      {
        "id": "4",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "1/3",
            "width": "1/3",
            "height": "1/3"
        }
      },
      {
        "id": "5",
        "shape": "rectangle",
        "area": {
            "left": "1/3",
            "top": "1/3",
            "width": "1/3",
            "height": "1/3"
        }
      },
      {
        "id": "6",
        "shape": "rectangle",
        "area": {
            "left": "2/3",
            "top": "1/3",
            "width": "1/3",
            "height": "1/3"
        }
      },
      {
        "id": "7",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "2/3",
            "width": "1/3",
            "height": "1/3"
        }
      },
      {
        "id": "8",
        "shape": "rectangle",
        "area": {
            "left": "1/3",
            "top": "2/3",
            "width": "1/3",
            "height": "1/3"
        }
      },
      {
        "id": "9",
        "shape": "rectangle",
        "area": {
            "left": "2/3",
            "top": "2/3",
            "width": "1/3",
            "height": "1/3"
        }
      }
    ]
  },

  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "0",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "2",
        "shape": "rectangle",
        "area": {
            "left": "1/4",
            "top": "0",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "3",
        "shape": "rectangle",
        "area": {
            "left": "2/4",
            "top": "0",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "4",
        "shape": "rectangle",
        "area": {
            "left": "3/4",
            "top": "0",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "5",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "1/3",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "6",
        "shape": "rectangle",
        "area": {
            "left": "1/4",
            "top": "1/3",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "7",
        "shape": "rectangle",
        "area": {
            "left": "2/4",
            "top": "1/3",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "8",
        "shape": "rectangle",
        "area": {
            "left": "3/4",
            "top": "1/3",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "9",
        "shape": "rectangle",
        "area": {
            "left": "1/4",
            "top": "2/3",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "10",
        "shape": "rectangle",
        "area": {
            "left": "2/4",
            "top": "2/3",
            "width": "1/4",
            "height": "1/3"
        }
      }
    ]
  },

  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "0",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "2",
        "shape": "rectangle",
        "area": {
            "left": "1/4",
            "top": "0",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "3",
        "shape": "rectangle",
        "area": {
            "left": "2/4",
            "top": "0",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "4",
        "shape": "rectangle",
        "area": {
            "left": "3/4",
            "top": "0",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "5",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "1/3",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "6",
        "shape": "rectangle",
        "area": {
            "left": "1/4",
            "top": "1/3",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "7",
        "shape": "rectangle",
        "area": {
            "left": "2/4",
            "top": "1/3",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "8",
        "shape": "rectangle",
        "area": {
            "left": "3/4",
            "top": "1/3",
            "width": "1/4",
            "height": "1/3"
        }
      },

      {
        "id": "9",
        "shape": "rectangle",
        "area": {
            "left": "1/8",
            "top": "2/3",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "10",
        "shape": "rectangle",
        "area": {
            "left": "3/8",
            "top": "2/3",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "11",
        "shape": "rectangle",
        "area": {
            "left": "5/8",
            "top": "2/3",
            "width": "1/4",
            "height": "1/3"
        }
      }
    ]
  },

  {
    "region": [
      {
        "id": "1",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "0",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "2",
        "shape": "rectangle",
        "area": {
            "left": "1/4",
            "top": "0",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "3",
        "shape": "rectangle",
        "area": {
            "left": "2/4",
            "top": "0",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "4",
        "shape": "rectangle",
        "area": {
            "left": "3/4",
            "top": "0",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "5",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "1/3",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "6",
        "shape": "rectangle",
        "area": {
            "left": "1/4",
            "top": "1/3",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "7",
        "shape": "rectangle",
        "area": {
            "left": "2/4",
            "top": "1/3",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "8",
        "shape": "rectangle",
        "area": {
            "left": "3/4",
            "top": "1/3",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "9",
        "shape": "rectangle",
        "area": {
            "left": "0",
            "top": "2/3",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "10",
        "shape": "rectangle",
        "area": {
            "left": "1/4",
            "top": "2/3",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "11",
        "shape": "rectangle",
        "area": {
            "left": "2/4",
            "top": "2/3",
            "width": "1/4",
            "height": "1/3"
        }
      },
      {
        "id": "12",
        "shape": "rectangle",
        "area": {
            "left": "3/4",
            "top": "2/3",
            "width": "1/4",
            "height": "1/3"
        }
      }
    ]
  }
            ]
          },
          "fitPolicy": "letterbox"
        },
        "maxInput": 10,
      },
    }
  ],
};
