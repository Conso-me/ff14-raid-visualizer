import { MechanicData, TimelineEvent } from './types';

export const sampleMechanic: MechanicData = {
  "id": "new-mechanic",
  "name": "New Mechanic",
  "description": "",
  "durationFrames": 300,
  "fps": 30,
  "field": {
    "type": "square",
    "size": 40,
    "backgroundColor": "#1a1a3e",
    "gridEnabled": true
  },
  "markers": [
    {
      "type": "A",
      "position": {
        "x": 0,
        "y": -15
      }
    },
    {
      "type": "B",
      "position": {
        "x": 15,
        "y": 0
      }
    },
    {
      "type": "C",
      "position": {
        "x": 0,
        "y": 15
      }
    },
    {
      "type": "D",
      "position": {
        "x": -15,
        "y": 0
      }
    },
    {
      "type": "1",
      "position": {
        "x": -10.6,
        "y": -10.6
      }
    },
    {
      "type": "2",
      "position": {
        "x": 10.6,
        "y": -10.6
      }
    },
    {
      "type": "3",
      "position": {
        "x": 10.6,
        "y": 10.6
      }
    },
    {
      "type": "4",
      "position": {
        "x": -10.6,
        "y": 10.6
      }
    }
  ],
  "initialPlayers": [
    {
      "id": "player_T1",
      "role": "T1",
      "position": {
        "x": 0,
        "y": -3.5
      }
    }
  ],
  "enemies": [
    {
      "id": "enemy_1769257057335",
      "name": "Boss",
      "position": {
        "x": 0,
        "y": 0
      },
      "size": 3,
      "color": "#ff0000"
    }
  ],
  "timeline": [
    {
      "id": "move-player_T1-1769256980142",
      "type": "move",
      "frame": 0,
      "targetId": "player_T1",
      "from": {
        "x": 0,
        "y": -3.5
      },
      "to": {
        "x": -2.5,
        "y": 1
      },
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "aoe-1769255285789-show",
      "type": "aoe_show",
      "frame": 29,
      "aoe": {
        "id": "aoe-1769255285789",
        "type": "cone",
        "position": {
          "x": 0,
          "y": 0
        },
        "angle": 90,
        "direction": 180,
        "length": 29,
        "color": "#eb0000",
        "opacity": 0.5
      },
      "fadeInDuration": 10
    },
    {
      "id": "aoe-1769255347283-show",
      "type": "aoe_show",
      "frame": 29,
      "aoe": {
        "id": "aoe-1769255347283",
        "type": "line",
        "position": {
          "x": -15,
          "y": 20
        },
        "direction": 0,
        "length": 40,
        "width": 10,
        "color": "#ff6600",
        "opacity": 0.5
      },
      "fadeInDuration": 10
    },
    {
      "id": "aoe-1769255252941-show",
      "type": "aoe_show",
      "frame": 30,
      "aoe": {
        "id": "aoe-1769255252941",
        "type": "cone",
        "position": {
          "x": 0,
          "y": 0
        },
        "angle": 90,
        "direction": 0,
        "length": 29,
        "color": "#eb0000",
        "opacity": 0.5
      },
      "fadeInDuration": 10
    },
    {
      "id": "aoe-1769255419865-show",
      "type": "aoe_show",
      "frame": 30,
      "aoe": {
        "id": "aoe-1769255419865",
        "type": "line",
        "position": {
          "x": 0,
          "y": 0
        },
        "direction": 0,
        "length": 10,
        "width": 40,
        "color": "#ff6600",
        "opacity": 0.5,
        "rotation": 0
      },
      "fadeInDuration": 10
    },
    {
      "id": "move-player_T1-1769255892081",
      "type": "move",
      "frame": 64,
      "targetId": "player_T1",
      "from": {
        "x": -2.5,
        "y": 1
      },
      "to": {
        "x": 2,
        "y": -2
      },
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "aoe-1769255252941-hide",
      "type": "aoe_hide",
      "frame": 89,
      "aoeId": "aoe-1769255252941",
      "fadeOutDuration": 15
    },
    {
      "id": "aoe-1769255419865-hide",
      "type": "aoe_hide",
      "frame": 89,
      "aoeId": "aoe-1769255419865",
      "fadeOutDuration": 15
    },
    {
      "id": "aoe-1769255285789-hide",
      "type": "aoe_hide",
      "frame": 90,
      "aoeId": "aoe-1769255285789",
      "fadeOutDuration": 15
    },
    {
      "id": "aoe-1769255347283-hide",
      "type": "aoe_hide",
      "frame": 90,
      "aoeId": "aoe-1769255347283",
      "fadeOutDuration": 15
    },
    {
      "id": "aoe-1769255525732-show",
      "type": "aoe_show",
      "frame": 105,
      "aoe": {
        "id": "aoe-1769255525732",
        "type": "line",
        "position": {
          "x": -5,
          "y": 20
        },
        "direction": 0,
        "length": 40,
        "width": 10,
        "color": "#ff6600",
        "opacity": 0.5
      },
      "fadeInDuration": 10
    },
    {
      "id": "aoe-1769255557367-show",
      "type": "aoe_show",
      "frame": 105,
      "aoe": {
        "id": "aoe-1769255557367",
        "type": "line",
        "position": {
          "x": 0,
          "y": 10
        },
        "direction": 0,
        "length": 10,
        "width": 40,
        "color": "#ff6600",
        "opacity": 0.5
      },
      "fadeInDuration": 10
    },
    {
      "id": "move-player_T1-1769255907030",
      "type": "move",
      "frame": 154,
      "targetId": "player_T1",
      "from": {
        "x": 2,
        "y": -2
      },
      "to": {
        "x": -2,
        "y": 2
      },
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "aoe-1769255525732-hide",
      "type": "aoe_hide",
      "frame": 164,
      "aoeId": "aoe-1769255525732",
      "fadeOutDuration": 15
    },
    {
      "id": "aoe-1769255557367-hide",
      "type": "aoe_hide",
      "frame": 164,
      "aoeId": "aoe-1769255557367",
      "fadeOutDuration": 15
    },
    {
      "id": "aoe-1769255610368-show",
      "type": "aoe_show",
      "frame": 179,
      "aoe": {
        "id": "aoe-1769255610368",
        "type": "line",
        "position": {
          "x": 15,
          "y": 20
        },
        "direction": 0,
        "length": 40,
        "width": 10,
        "color": "#ff6600",
        "opacity": 0.5
      },
      "fadeInDuration": 10
    },
    {
      "id": "aoe-1769255628232-show",
      "type": "aoe_show",
      "frame": 179,
      "aoe": {
        "id": "aoe-1769255628232",
        "type": "line",
        "position": {
          "x": 0,
          "y": 20
        },
        "direction": 0,
        "length": 10,
        "width": 40,
        "color": "#ff6600",
        "opacity": 0.5
      },
      "fadeInDuration": 10
    },
    {
      "id": "aoe-1769255610368-hide",
      "type": "aoe_hide",
      "frame": 239,
      "aoeId": "aoe-1769255610368",
      "fadeOutDuration": 15
    },
    {
      "id": "aoe-1769255628232-hide",
      "type": "aoe_hide",
      "frame": 239,
      "aoeId": "aoe-1769255628232",
      "fadeOutDuration": 15
    },
    {
      "id": "aoe-1769255705033-show",
      "type": "aoe_show",
      "frame": 254,
      "aoe": {
        "id": "aoe-1769255705033",
        "type": "line",
        "position": {
          "x": 5,
          "y": 20
        },
        "direction": 0,
        "length": 40,
        "width": 10,
        "color": "#ff6600",
        "opacity": 0.5
      },
      "fadeInDuration": 10
    },
    {
      "id": "aoe-1769255714725-show",
      "type": "aoe_show",
      "frame": 254,
      "aoe": {
        "id": "aoe-1769255714725",
        "type": "line",
        "position": {
          "x": 0,
          "y": -10
        },
        "direction": 0,
        "length": 10,
        "width": 40,
        "color": "#ff6600",
        "opacity": 0.5
      },
      "fadeInDuration": 10
    },
    {
      "id": "aoe-1769255705033-hide",
      "type": "aoe_hide",
      "frame": 299,
      "aoeId": "aoe-1769255705033",
      "fadeOutDuration": 15
    },
    {
      "id": "aoe-1769255714725-hide",
      "type": "aoe_hide",
      "frame": 299,
      "aoeId": "aoe-1769255714725",
      "fadeOutDuration": 15
    }
  ]
};
