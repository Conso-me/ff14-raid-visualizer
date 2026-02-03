import type { MechanicData } from './types';

export const sampleLethalScourge: MechanicData = {
  "id": "sample-lethal-scourge",
  "name": "リーサルスカージ",
  "description": "",
  "durationFrames": 705,
  "fps": 30,
  "field": {
    "type": "rectangle",
    "size": 40,
    "backgroundColor": "#1a1a3e",
    "gridEnabled": true,
    "width": 60
  },
  "markers": [],
  "initialPlayers": [
    {"id": "player_T1", "role": "T1", "position": {"x": -6, "y": 1}},
    {"id": "player_T2", "role": "T2", "position": {"x": 2, "y": 1}},
    {"id": "player_H1", "role": "H1", "position": {"x": -3, "y": 1}},
    {"id": "player_H2", "role": "H2", "position": {"x": 5, "y": 1}},
    {"id": "player_D1", "role": "D1", "position": {"x": -3, "y": 3.5}},
    {"id": "player_D2", "role": "D2", "position": {"x": 5, "y": 3.5}},
    {"id": "player_D3", "role": "D3", "position": {"x": -3, "y": 6}},
    {"id": "player_D4", "role": "D4", "position": {"x": 5, "y": 6}}
  ],
  "enemies": [
    {"id": "boss", "name": "Boss", "position": {"x": 0, "y": -15.5}}
  ],
  "timeline": [
    {
      "id": "imported_1770066153191_s4mpeb0f5",
      "type": "cast",
      "frame": 0,
      "casterId": "boss",
      "skillName": "リーサルスカージ",
      "duration": 90
    },
    {
      "id": "imported_1770066153191_kp1nfms7v",
      "type": "object_show",
      "frame": 60,
      "fadeInDuration": 10,
      "object": {
        "id": "obj_1770066153191_r6sw4q5uj",
        "name": "玉A-西",
        "position": {"x": -8.5, "y": -19},
        "shape": "circle",
        "size": 1.5,
        "color": "#66ff66",
        "opacity": 1
      }
    },
    {
      "id": "imported_1770066153191_6rscgh7a5",
      "type": "object_show",
      "frame": 60,
      "fadeInDuration": 10,
      "object": {
        "id": "obj_1770066153191_k2rhxejnj",
        "name": "玉A-東",
        "position": {"x": 9, "y": -19},
        "shape": "circle",
        "size": 1.5,
        "color": "#cc66ff",
        "opacity": 1
      }
    },
    {
      "id": "move-player_T1-1770066396010-5bu3qysvp",
      "type": "move",
      "frame": 92,
      "targetId": "player_T1",
      "from": {"x": -6, "y": 1},
      "to": {"x": 2, "y": 6},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "move-player_D4-1770066400515-hcqegx63s",
      "type": "move",
      "frame": 92,
      "targetId": "player_D4",
      "from": {"x": 5, "y": 6},
      "to": {"x": -3, "y": 8.5},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "imported_1770066153191_uw2cyjnqa",
      "type": "object_show",
      "frame": 120,
      "fadeInDuration": 10,
      "object": {
        "id": "obj_1770066153191_l4kciqg2u",
        "name": "玉B-西",
        "position": {"x": -7.5, "y": -17},
        "shape": "circle",
        "size": 1.5,
        "color": "#66ff66",
        "opacity": 1
      }
    },
    {
      "id": "imported_1770066153191_pyf3u3qz8",
      "type": "object_show",
      "frame": 120,
      "fadeInDuration": 10,
      "object": {
        "id": "obj_1770066153191_4atnhzcuh",
        "name": "玉B-東",
        "position": {"x": 7.5, "y": -17},
        "shape": "circle",
        "size": 1.5,
        "color": "#cc66ff",
        "opacity": 1
      }
    },
    {
      "id": "move-player_H1-1770066425428-vsoo969tf",
      "type": "move",
      "frame": 150,
      "targetId": "player_H1",
      "from": {"x": -3, "y": 1},
      "to": {"x": -7, "y": -11.5},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "move-player_T2-1770066476084-igpm0ax84",
      "type": "move",
      "frame": 150,
      "targetId": "player_T2",
      "from": {"x": 2, "y": 1},
      "to": {"x": 5, "y": -11},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "imported_1770066153191_apmdkoizi",
      "type": "object_show",
      "frame": 180,
      "fadeInDuration": 10,
      "object": {
        "id": "obj_1770066153191_dz3gb7svz",
        "name": "玉C-西",
        "position": {"x": -5.5, "y": -15.5},
        "shape": "circle",
        "size": 1.5,
        "color": "#66ff66",
        "opacity": 1
      }
    },
    {
      "id": "imported_1770066153191_c28554s0v",
      "type": "object_show",
      "frame": 180,
      "fadeInDuration": 10,
      "object": {
        "id": "obj_1770066153191_woctf5rhj",
        "name": "玉C-東",
        "position": {"x": 5.5, "y": -15.5},
        "shape": "circle",
        "size": 1.5,
        "color": "#66ff66",
        "opacity": 1
      }
    },
    {
      "id": "move-player_D1-1770066434997-ufmoitd4j",
      "type": "move",
      "frame": 225,
      "targetId": "player_D1",
      "from": {"x": -3, "y": 3.5},
      "to": {"x": -5, "y": 0},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "imported_1770066153191_urzexlvpn",
      "type": "object_show",
      "frame": 240,
      "fadeInDuration": 10,
      "object": {
        "id": "obj_1770066153191_x3hrtcyt6",
        "name": "玉D-西",
        "position": {"x": -3, "y": -14},
        "shape": "circle",
        "size": 1.5,
        "color": "#66ff66",
        "opacity": 1
      }
    },
    {
      "id": "imported_1770066153191_dfmabeiq9",
      "type": "object_show",
      "frame": 240,
      "fadeInDuration": 10,
      "object": {
        "id": "obj_1770066153191_xtlevsy6s",
        "name": "玉D-東",
        "position": {"x": 3.5, "y": -14},
        "shape": "circle",
        "size": 1.5,
        "color": "#66ff66",
        "opacity": 1
      }
    },
    {
      "id": "imported_1770066153191_sc84hgtcf",
      "type": "object_hide",
      "frame": 330,
      "objectId": "obj_1770066153191_r6sw4q5uj",
      "fadeOutDuration": 15
    },
    {
      "id": "imported_1770066153191_k1zsiv9tv",
      "type": "object_hide",
      "frame": 330,
      "objectId": "obj_1770066153191_k2rhxejnj",
      "fadeOutDuration": 15
    },
    {
      "id": "imported_1770066153191_qefrca0j6",
      "type": "text",
      "frame": 330,
      "textType": "main",
      "content": "玉A着弾",
      "position": "center",
      "duration": 90
    },
    {
      "id": "imported_1770066153191_mkxoklw1p",
      "type": "aoe_show",
      "frame": 330,
      "fadeInDuration": 10,
      "aoe": {
        "id": "aoe_1770066153191_rmwbra9jf",
        "type": "circle",
        "position": {"x": -7, "y": -11.5},
        "color": "#ff6600",
        "opacity": 0.5,
        "sourceType": "player",
        "sourceId": "player_H1",
        "trackingMode": "track_source",
        "radius": 4
      }
    },
    {
      "id": "imported_1770066153191_i5cam44nl",
      "type": "aoe_show",
      "frame": 331,
      "fadeInDuration": 10,
      "aoe": {
        "id": "aoe_1770066153191_w3vd02uyl",
        "type": "circle",
        "position": {"x": 5, "y": -11},
        "color": "#ff6600",
        "opacity": 0.5,
        "sourceType": "fixed",
        "trackingMode": "static",
        "radius": 4
      }
    },
    {
      "id": "imported_1770066153191_ah9ckd09y",
      "type": "aoe_hide",
      "frame": 375,
      "aoeId": "aoe_1770066153191_rmwbra9jf",
      "fadeOutDuration": 15
    },
    {
      "id": "imported_1770066153191_igv6o58k4",
      "type": "aoe_hide",
      "frame": 375,
      "aoeId": "aoe_1770066153191_w3vd02uyl",
      "fadeOutDuration": 15
    },
    {
      "id": "move-player_H1-1770066598547-4ubnoal3e",
      "type": "move",
      "frame": 390,
      "targetId": "player_H1",
      "from": {"x": -7, "y": -11.5},
      "to": {"x": -3.5, "y": 2},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "move-player_T1-1770066603675-hdn8egias",
      "type": "move",
      "frame": 390,
      "targetId": "player_T1",
      "from": {"x": 2, "y": 6},
      "to": {"x": 4, "y": -11},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "move-player_D1-1770066611201-brry0x2kj",
      "type": "move",
      "frame": 390,
      "targetId": "player_D1",
      "from": {"x": -5, "y": 0},
      "to": {"x": -4.5, "y": -11},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "move-player_T2-1770066513656-pgohyix84",
      "type": "move",
      "frame": 393,
      "targetId": "player_T2",
      "from": {"x": 5, "y": -11},
      "to": {"x": 2, "y": 1},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "imported_1770066153191_23694qh0k",
      "type": "object_hide",
      "frame": 420,
      "objectId": "obj_1770066153191_l4kciqg2u",
      "fadeOutDuration": 15
    },
    {
      "id": "imported_1770066153191_15am2oz3n",
      "type": "object_hide",
      "frame": 420,
      "objectId": "obj_1770066153191_4atnhzcuh",
      "fadeOutDuration": 15
    },
    {
      "id": "imported_1770066153191_y73n58rp7",
      "type": "text",
      "frame": 420,
      "textType": "main",
      "content": "玉B着弾",
      "position": "center",
      "duration": 90
    },
    {
      "id": "imported_1770066153191_7r5aexvfe",
      "type": "aoe_show",
      "frame": 420,
      "fadeInDuration": 10,
      "aoe": {
        "id": "aoe_1770066153191_0vljpakmv",
        "type": "circle",
        "position": {"x": 0, "y": 0},
        "color": "#ff6600",
        "opacity": 0.5,
        "sourceType": "player",
        "sourceId": "player_T1",
        "trackingMode": "track_source",
        "radius": 4
      }
    },
    {
      "id": "imported_1770066153191_dg7tf7oak",
      "type": "aoe_show",
      "frame": 420,
      "fadeInDuration": 10,
      "aoe": {
        "id": "aoe_1770066153191_tlnbrszg4",
        "type": "circle",
        "position": {"x": 0, "y": 0},
        "color": "#ff6600",
        "opacity": 0.5,
        "sourceType": "player",
        "sourceId": "player_D1",
        "trackingMode": "track_source",
        "radius": 4
      }
    },
    {
      "id": "imported_1770066153191_kkeo3lh1u",
      "type": "aoe_hide",
      "frame": 465,
      "aoeId": "aoe_1770066153191_0vljpakmv",
      "fadeOutDuration": 15
    },
    {
      "id": "imported_1770066153191_lstyg3n2m",
      "type": "aoe_hide",
      "frame": 465,
      "aoeId": "aoe_1770066153191_tlnbrszg4",
      "fadeOutDuration": 15
    },
    {
      "id": "move-player_T1-1770066647498-l95g4q91y",
      "type": "move",
      "frame": 480,
      "targetId": "player_T1",
      "from": {"x": 4, "y": -11},
      "to": {"x": 1.5, "y": 4},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "move-player_D1-1770066650592-klwojew7z",
      "type": "move",
      "frame": 480,
      "targetId": "player_D1",
      "from": {"x": -4.5, "y": -11},
      "to": {"x": -5, "y": 3.5},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "move-player_D3-1770066654086-y20yp9pjy",
      "type": "move",
      "frame": 480,
      "targetId": "player_D3",
      "from": {"x": -3, "y": 6},
      "to": {"x": -5, "y": -11},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "move-player_H2-1770066657575-h0jc15b03",
      "type": "move",
      "frame": 480,
      "targetId": "player_H2",
      "from": {"x": 5, "y": 1},
      "to": {"x": 5, "y": -10.5},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "imported_1770066153191_qt7llinp8",
      "type": "object_hide",
      "frame": 510,
      "objectId": "obj_1770066153191_dz3gb7svz",
      "fadeOutDuration": 15
    },
    {
      "id": "imported_1770066153191_dqagb7ktl",
      "type": "object_hide",
      "frame": 510,
      "objectId": "obj_1770066153191_woctf5rhj",
      "fadeOutDuration": 15
    },
    {
      "id": "imported_1770066153191_59flphhpw",
      "type": "text",
      "frame": 510,
      "textType": "main",
      "content": "玉C着弾",
      "position": "center",
      "duration": 90
    },
    {
      "id": "imported_1770066153191_fo41u9vgn",
      "type": "aoe_show",
      "frame": 510,
      "fadeInDuration": 10,
      "aoe": {
        "id": "aoe_1770066153191_rlji4qbnm",
        "type": "circle",
        "position": {"x": 0, "y": 0},
        "color": "#ff6600",
        "opacity": 0.5,
        "sourceType": "player",
        "sourceId": "player_D3",
        "trackingMode": "track_source",
        "radius": 4
      }
    },
    {
      "id": "imported_1770066153191_3eqxygfef",
      "type": "aoe_show",
      "frame": 510,
      "fadeInDuration": 10,
      "aoe": {
        "id": "aoe_1770066153191_9ee3h6wxe",
        "type": "circle",
        "position": {"x": 0, "y": 0},
        "color": "#ff6600",
        "opacity": 0.5,
        "sourceType": "player",
        "sourceId": "player_H2",
        "trackingMode": "track_source",
        "radius": 4
      }
    },
    {
      "id": "imported_1770066153191_zj5sars4p",
      "type": "aoe_hide",
      "frame": 555,
      "aoeId": "aoe_1770066153191_rlji4qbnm",
      "fadeOutDuration": 15
    },
    {
      "id": "imported_1770066153191_x31ci7gtv",
      "type": "aoe_hide",
      "frame": 555,
      "aoeId": "aoe_1770066153191_9ee3h6wxe",
      "fadeOutDuration": 15
    },
    {
      "id": "move-player_D2-1770066677639-m79c5ewhj",
      "type": "move",
      "frame": 570,
      "targetId": "player_D2",
      "from": {"x": 5, "y": 3.5},
      "to": {"x": 4, "y": -11},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "move-player_H2-1770066680476-6ku0nl4vk",
      "type": "move",
      "frame": 570,
      "targetId": "player_H2",
      "from": {"x": 5, "y": -10.5},
      "to": {"x": 4.5, "y": 3.5},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "move-player_D3-1770066684669-oaly8osa1",
      "type": "move",
      "frame": 570,
      "targetId": "player_D3",
      "from": {"x": -5, "y": -11},
      "to": {"x": -7, "y": 3},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "move-player_D4-1770066688117-oxwyzvwfa",
      "type": "move",
      "frame": 570,
      "targetId": "player_D4",
      "from": {"x": -3, "y": 8.5},
      "to": {"x": -4, "y": -11},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "imported_1770066153191_pf0k6n6vq",
      "type": "object_hide",
      "frame": 600,
      "objectId": "obj_1770066153191_x3hrtcyt6",
      "fadeOutDuration": 15
    },
    {
      "id": "imported_1770066153191_j1m9tgmp1",
      "type": "object_hide",
      "frame": 600,
      "objectId": "obj_1770066153191_xtlevsy6s",
      "fadeOutDuration": 15
    },
    {
      "id": "imported_1770066153191_6slsvb7b3",
      "type": "text",
      "frame": 600,
      "textType": "main",
      "content": "玉D着弾",
      "position": "center",
      "duration": 90
    },
    {
      "id": "imported_1770066153191_em4qoy0u3",
      "type": "aoe_show",
      "frame": 600,
      "fadeInDuration": 10,
      "aoe": {
        "id": "aoe_1770066153191_r15ree08x",
        "type": "circle",
        "position": {"x": 0, "y": 0},
        "color": "#ff6600",
        "opacity": 0.5,
        "sourceType": "player",
        "sourceId": "player_D4",
        "trackingMode": "track_source",
        "radius": 4
      }
    },
    {
      "id": "imported_1770066153191_urwp30h1h",
      "type": "aoe_show",
      "frame": 600,
      "fadeInDuration": 10,
      "aoe": {
        "id": "aoe_1770066153191_77fnxhn16",
        "type": "circle",
        "position": {"x": 0, "y": 0},
        "color": "#ff6600",
        "opacity": 0.5,
        "sourceType": "player",
        "sourceId": "player_D2",
        "trackingMode": "track_source",
        "radius": 4
      }
    },
    {
      "id": "imported_1770066153191_77meevfxq",
      "type": "aoe_hide",
      "frame": 645,
      "aoeId": "aoe_1770066153191_r15ree08x",
      "fadeOutDuration": 15
    },
    {
      "id": "imported_1770066153191_rcskx7atz",
      "type": "aoe_hide",
      "frame": 645,
      "aoeId": "aoe_1770066153191_77fnxhn16",
      "fadeOutDuration": 15
    },
    {
      "id": "move-player_D4-1770066726872-vkcshk4za",
      "type": "move",
      "frame": 664,
      "targetId": "player_D4",
      "from": {"x": -4, "y": -11},
      "to": {"x": -11.5, "y": -11},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "move-player_D2-1770066726872-hga9e8ume",
      "type": "move",
      "frame": 664,
      "targetId": "player_D2",
      "from": {"x": 4, "y": -11},
      "to": {"x": -11.5, "y": -11},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "move-player_T2-1770066726872-o9bxykqp0",
      "type": "move",
      "frame": 664,
      "targetId": "player_T2",
      "from": {"x": 2, "y": 1},
      "to": {"x": -11.5, "y": -11},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "move-player_T1-1770066726872-kwcvt2is6",
      "type": "move",
      "frame": 664,
      "targetId": "player_T1",
      "from": {"x": 1.5, "y": 4},
      "to": {"x": -11.5, "y": -11},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "move-player_H2-1770066726872-5xu4bi9nc",
      "type": "move",
      "frame": 664,
      "targetId": "player_H2",
      "from": {"x": 4.5, "y": 3.5},
      "to": {"x": -11.5, "y": -11},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "move-player_H1-1770066726872-2p1mcvmc8",
      "type": "move",
      "frame": 664,
      "targetId": "player_H1",
      "from": {"x": -3.5, "y": 2},
      "to": {"x": -11.5, "y": -11},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "move-player_D1-1770066726872-2edtw1qoz",
      "type": "move",
      "frame": 664,
      "targetId": "player_D1",
      "from": {"x": -5, "y": 3.5},
      "to": {"x": -11.5, "y": -11},
      "duration": 30,
      "easing": "easeInOut"
    },
    {
      "id": "move-player_D3-1770066726872-b79yxxhl9",
      "type": "move",
      "frame": 664,
      "targetId": "player_D3",
      "from": {"x": -7, "y": 3},
      "to": {"x": -11.5, "y": -11},
      "duration": 30,
      "easing": "easeInOut"
    }
  ]
};
