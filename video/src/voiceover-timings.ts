// Auto-generated from public/voiceover.timings.json
export interface TimedWord {
  word: string;
  startSec: number;
  endSec: number;
  startFrame: number;
  endFrame: number;
  localStartFrame?: number;
  localEndFrame?: number;
}

export interface SceneTiming {
  id: string;
  name: string;
  startFrame: number;
  endFrame: number;
  durationInFrames: number;
  fullText: string;
  words: TimedWord[];
}

export interface VoiceoverData {
  fps: number;
  voiceDurationSeconds: number;
  totalDurationSeconds: number;
  totalDurationFrames: number;
  voiceoverFile: string;
  scenes: SceneTiming[];
  allWords: TimedWord[];
}

export const VOICEOVER_DATA: VoiceoverData = {
  "fps": 30,
  "voiceDurationSeconds": 45.19,
  "totalDurationSeconds": 47.69,
  "totalDurationFrames": 1431,
  "voiceoverFile": "voiceover.mp3",
  "scenes": [
    {
      "id": "scene1",
      "name": "Intro",
      "words": [
        {
          "word": "Campus",
          "startSec": 0.25,
          "endSec": 0.796,
          "startFrame": 8,
          "endFrame": 24,
          "localStartFrame": 8,
          "localEndFrame": 24
        },
        {
          "word": "life",
          "startSec": 0.865,
          "endSec": 1.202,
          "startFrame": 26,
          "endFrame": 36,
          "localStartFrame": 26,
          "localEndFrame": 36
        },
        {
          "word": "moves",
          "startSec": 1.272,
          "endSec": 1.597,
          "startFrame": 38,
          "endFrame": 48,
          "localStartFrame": 38,
          "localEndFrame": 48
        },
        {
          "word": "fast.",
          "startSec": 1.666,
          "endSec": 2.259,
          "startFrame": 50,
          "endFrame": 68,
          "localStartFrame": 50,
          "localEndFrame": 68
        },
        {
          "word": "Too",
          "startSec": 2.709,
          "endSec": 2.894,
          "startFrame": 81,
          "endFrame": 87,
          "localStartFrame": 81,
          "localEndFrame": 87
        },
        {
          "word": "fast",
          "startSec": 2.952,
          "endSec": 3.219,
          "startFrame": 89,
          "endFrame": 97,
          "localStartFrame": 89,
          "localEndFrame": 97
        },
        {
          "word": "to",
          "startSec": 3.254,
          "endSec": 3.312,
          "startFrame": 98,
          "endFrame": 99,
          "localStartFrame": 98,
          "localEndFrame": 99
        },
        {
          "word": "follow.",
          "startSec": 3.37,
          "endSec": 3.939,
          "startFrame": 101,
          "endFrame": 118,
          "localStartFrame": 101,
          "localEndFrame": 118
        },
        {
          "word": "Meet",
          "startSec": 4.839,
          "endSec": 5.083,
          "startFrame": 145,
          "endFrame": 152,
          "localStartFrame": 145,
          "localEndFrame": 152
        },
        {
          "word": "TAGA-asK",
          "startSec": 5.141,
          "endSec": 5.826,
          "startFrame": 154,
          "endFrame": 175,
          "localStartFrame": 154,
          "localEndFrame": 175
        },
        {
          "word": "AI.",
          "startSec": 5.895,
          "endSec": 6.604,
          "startFrame": 177,
          "endFrame": 198,
          "localStartFrame": 177,
          "localEndFrame": 198
        }
      ],
      "startFrame": 0,
      "endFrame": 215,
      "durationInFrames": 215,
      "fullText": "Campus life moves fast. Too fast to follow. Meet TAGA-asK AI."
    },
    {
      "id": "scene2",
      "name": "Problem",
      "words": [
        {
          "word": "Schedules,",
          "startSec": 7.254,
          "endSec": 7.823,
          "startFrame": 218,
          "endFrame": 235,
          "localStartFrame": 3,
          "localEndFrame": 20
        },
        {
          "word": "rooms,",
          "startSec": 7.869,
          "endSec": 8.264,
          "startFrame": 236,
          "endFrame": 248,
          "localStartFrame": 21,
          "localEndFrame": 33
        },
        {
          "word": "policies...",
          "startSec": 8.299,
          "endSec": 8.949,
          "startFrame": 249,
          "endFrame": 268,
          "localStartFrame": 34,
          "localEndFrame": 53
        },
        {
          "word": "all",
          "startSec": 9.399,
          "endSec": 9.689,
          "startFrame": 282,
          "endFrame": 291,
          "localStartFrame": 67,
          "localEndFrame": 76
        },
        {
          "word": "scattered.",
          "startSec": 9.759,
          "endSec": 10.328,
          "startFrame": 293,
          "endFrame": 310,
          "localStartFrame": 78,
          "localEndFrame": 95
        },
        {
          "word": "All",
          "startSec": 10.878,
          "endSec": 11.11,
          "startFrame": 326,
          "endFrame": 333,
          "localStartFrame": 111,
          "localEndFrame": 118
        },
        {
          "word": "unclear.",
          "startSec": 11.203,
          "endSec": 11.9,
          "startFrame": 336,
          "endFrame": 357,
          "localStartFrame": 121,
          "localEndFrame": 142
        }
      ],
      "startFrame": 215,
      "endFrame": 380,
      "durationInFrames": 165,
      "fullText": "Schedules, rooms, policies... all scattered. All unclear."
    },
    {
      "id": "scene3",
      "name": "Solution",
      "words": [
        {
          "word": "But",
          "startSec": 12.75,
          "endSec": 12.935,
          "startFrame": 383,
          "endFrame": 388,
          "localStartFrame": 3,
          "localEndFrame": 8
        },
        {
          "word": "what",
          "startSec": 12.982,
          "endSec": 13.156,
          "startFrame": 389,
          "endFrame": 395,
          "localStartFrame": 9,
          "localEndFrame": 15
        },
        {
          "word": "if",
          "startSec": 13.203,
          "endSec": 13.272,
          "startFrame": 396,
          "endFrame": 398,
          "localStartFrame": 16,
          "localEndFrame": 18
        },
        {
          "word": "every",
          "startSec": 13.33,
          "endSec": 13.539,
          "startFrame": 400,
          "endFrame": 406,
          "localStartFrame": 20,
          "localEndFrame": 26
        },
        {
          "word": "answer...",
          "startSec": 13.597,
          "endSec": 14.131,
          "startFrame": 408,
          "endFrame": 424,
          "localStartFrame": 28,
          "localEndFrame": 44
        },
        {
          "word": "just",
          "startSec": 14.511,
          "endSec": 14.709,
          "startFrame": 435,
          "endFrame": 441,
          "localStartFrame": 55,
          "localEndFrame": 61
        },
        {
          "word": "made",
          "startSec": 14.755,
          "endSec": 14.929,
          "startFrame": 443,
          "endFrame": 448,
          "localStartFrame": 63,
          "localEndFrame": 68
        },
        {
          "word": "sense?",
          "startSec": 14.964,
          "endSec": 15.44,
          "startFrame": 449,
          "endFrame": 463,
          "localStartFrame": 69,
          "localEndFrame": 83
        },
        {
          "word": "One",
          "startSec": 16.09,
          "endSec": 16.322,
          "startFrame": 483,
          "endFrame": 490,
          "localStartFrame": 103,
          "localEndFrame": 110
        },
        {
          "word": "place",
          "startSec": 16.357,
          "endSec": 16.624,
          "startFrame": 491,
          "endFrame": 499,
          "localStartFrame": 111,
          "localEndFrame": 119
        },
        {
          "word": "to",
          "startSec": 16.659,
          "endSec": 16.729,
          "startFrame": 500,
          "endFrame": 502,
          "localStartFrame": 120,
          "localEndFrame": 122
        },
        {
          "word": "ask,",
          "startSec": 16.845,
          "endSec": 17.286,
          "startFrame": 505,
          "endFrame": 519,
          "localStartFrame": 125,
          "localEndFrame": 139
        },
        {
          "word": "to",
          "startSec": 17.321,
          "endSec": 17.425,
          "startFrame": 520,
          "endFrame": 523,
          "localStartFrame": 140,
          "localEndFrame": 143
        },
        {
          "word": "verify,",
          "startSec": 17.495,
          "endSec": 18.122,
          "startFrame": 525,
          "endFrame": 544,
          "localStartFrame": 145,
          "localEndFrame": 164
        },
        {
          "word": "to",
          "startSec": 18.157,
          "endSec": 18.238,
          "startFrame": 545,
          "endFrame": 547,
          "localStartFrame": 165,
          "localEndFrame": 167
        },
        {
          "word": "understand.",
          "startSec": 18.319,
          "endSec": 19.213,
          "startFrame": 550,
          "endFrame": 576,
          "localStartFrame": 170,
          "localEndFrame": 196
        }
      ],
      "startFrame": 380,
      "endFrame": 596,
      "durationInFrames": 216,
      "fullText": "But what if every answer... just made sense? One place to ask, to verify, to understand."
    },
    {
      "id": "scene4",
      "name": "HeroCIT",
      "words": [
        {
          "word": "Ask:",
          "startSec": 19.963,
          "endSec": 20.497,
          "startFrame": 599,
          "endFrame": 615,
          "localStartFrame": 3,
          "localEndFrame": 19
        },
        {
          "word": "Where",
          "startSec": 20.671,
          "endSec": 20.926,
          "startFrame": 620,
          "endFrame": 628,
          "localStartFrame": 24,
          "localEndFrame": 32
        },
        {
          "word": "is",
          "startSec": 20.973,
          "endSec": 21.054,
          "startFrame": 629,
          "endFrame": 632,
          "localStartFrame": 33,
          "localEndFrame": 36
        },
        {
          "word": "the",
          "startSec": 21.112,
          "endSec": 21.182,
          "startFrame": 633,
          "endFrame": 635,
          "localStartFrame": 37,
          "localEndFrame": 39
        },
        {
          "word": "CIT?",
          "startSec": 21.229,
          "endSec": 22.007,
          "startFrame": 637,
          "endFrame": 660,
          "localStartFrame": 41,
          "localEndFrame": 64
        },
        {
          "word": "Second",
          "startSec": 22.657,
          "endSec": 22.97,
          "startFrame": 680,
          "endFrame": 689,
          "localStartFrame": 84,
          "localEndFrame": 93
        },
        {
          "word": "Floor,",
          "startSec": 23.017,
          "endSec": 23.434,
          "startFrame": 691,
          "endFrame": 703,
          "localStartFrame": 95,
          "localEndFrame": 107
        },
        {
          "word": "South",
          "startSec": 23.516,
          "endSec": 23.806,
          "startFrame": 705,
          "endFrame": 714,
          "localStartFrame": 109,
          "localEndFrame": 118
        },
        {
          "word": "Wing,",
          "startSec": 23.864,
          "endSec": 24.166,
          "startFrame": 716,
          "endFrame": 725,
          "localStartFrame": 120,
          "localEndFrame": 129
        },
        {
          "word": "Admin",
          "startSec": 24.224,
          "endSec": 24.63,
          "startFrame": 727,
          "endFrame": 739,
          "localStartFrame": 131,
          "localEndFrame": 143
        },
        {
          "word": "Building.",
          "startSec": 24.688,
          "endSec": 25.222,
          "startFrame": 741,
          "endFrame": 757,
          "localStartFrame": 145,
          "localEndFrame": 161
        },
        {
          "word": "Source",
          "startSec": 25.672,
          "endSec": 26.009,
          "startFrame": 770,
          "endFrame": 780,
          "localStartFrame": 174,
          "localEndFrame": 184
        },
        {
          "word": "03,",
          "startSec": 26.079,
          "endSec": 26.833,
          "startFrame": 782,
          "endFrame": 805,
          "localStartFrame": 186,
          "localEndFrame": 209
        },
        {
          "word": "page",
          "startSec": 26.88,
          "endSec": 27.182,
          "startFrame": 806,
          "endFrame": 815,
          "localStartFrame": 210,
          "localEndFrame": 219
        },
        {
          "word": "1.",
          "startSec": 27.228,
          "endSec": 27.658,
          "startFrame": 817,
          "endFrame": 830,
          "localStartFrame": 221,
          "localEndFrame": 234
        }
      ],
      "startFrame": 596,
      "endFrame": 851,
      "durationInFrames": 255,
      "fullText": "Ask: Where is the CIT? Second Floor, South Wing, Admin Building. Source 03, page 1."
    },
    {
      "id": "scene5",
      "name": "UploadsAndMap",
      "words": [
        {
          "word": "Upload",
          "startSec": 28.458,
          "endSec": 28.795,
          "startFrame": 854,
          "endFrame": 864,
          "localStartFrame": 3,
          "localEndFrame": 13
        },
        {
          "word": "a",
          "startSec": 28.83,
          "endSec": 28.853,
          "startFrame": 865,
          "endFrame": 866,
          "localStartFrame": 14,
          "localEndFrame": 15
        },
        {
          "word": "schedule,",
          "startSec": 28.888,
          "endSec": 29.387,
          "startFrame": 867,
          "endFrame": 882,
          "localStartFrame": 16,
          "localEndFrame": 31
        },
        {
          "word": "or",
          "startSec": 29.434,
          "endSec": 29.596,
          "startFrame": 883,
          "endFrame": 888,
          "localStartFrame": 32,
          "localEndFrame": 37
        },
        {
          "word": "a",
          "startSec": 29.643,
          "endSec": 29.666,
          "startFrame": 889,
          "endFrame": 890,
          "localStartFrame": 38,
          "localEndFrame": 39
        },
        {
          "word": "photo.",
          "startSec": 29.701,
          "endSec": 30.223,
          "startFrame": 891,
          "endFrame": 907,
          "localStartFrame": 40,
          "localEndFrame": 56
        },
        {
          "word": "Need",
          "startSec": 30.773,
          "endSec": 30.982,
          "startFrame": 923,
          "endFrame": 929,
          "localStartFrame": 72,
          "localEndFrame": 78
        },
        {
          "word": "directions?",
          "startSec": 31.017,
          "endSec": 31.76,
          "startFrame": 931,
          "endFrame": 953,
          "localStartFrame": 80,
          "localEndFrame": 102
        },
        {
          "word": "Open",
          "startSec": 31.934,
          "endSec": 32.201,
          "startFrame": 958,
          "endFrame": 966,
          "localStartFrame": 107,
          "localEndFrame": 115
        },
        {
          "word": "the",
          "startSec": 32.236,
          "endSec": 32.306,
          "startFrame": 967,
          "endFrame": 969,
          "localStartFrame": 116,
          "localEndFrame": 118
        },
        {
          "word": "campus",
          "startSec": 32.329,
          "endSec": 32.665,
          "startFrame": 970,
          "endFrame": 980,
          "localStartFrame": 119,
          "localEndFrame": 129
        },
        {
          "word": "map.",
          "startSec": 32.724,
          "endSec": 33.072,
          "startFrame": 982,
          "endFrame": 992,
          "localStartFrame": 131,
          "localEndFrame": 141
        }
      ],
      "startFrame": 851,
      "endFrame": 1015,
      "durationInFrames": 164,
      "fullText": "Upload a schedule, or a photo. Need directions? Open the campus map."
    },
    {
      "id": "scene6",
      "name": "Security",
      "words": [
        {
          "word": "UMak",
          "startSec": 33.922,
          "endSec": 34.328,
          "startFrame": 1018,
          "endFrame": 1030,
          "localStartFrame": 3,
          "localEndFrame": 15
        },
        {
          "word": "accounts",
          "startSec": 34.386,
          "endSec": 34.746,
          "startFrame": 1032,
          "endFrame": 1042,
          "localStartFrame": 17,
          "localEndFrame": 27
        },
        {
          "word": "only.",
          "startSec": 34.816,
          "endSec": 35.257,
          "startFrame": 1044,
          "endFrame": 1058,
          "localStartFrame": 29,
          "localEndFrame": 43
        },
        {
          "word": "Protected",
          "startSec": 35.707,
          "endSec": 36.195,
          "startFrame": 1071,
          "endFrame": 1086,
          "localStartFrame": 56,
          "localEndFrame": 71
        },
        {
          "word": "from",
          "startSec": 36.23,
          "endSec": 36.369,
          "startFrame": 1087,
          "endFrame": 1091,
          "localStartFrame": 72,
          "localEndFrame": 76
        },
        {
          "word": "spam.",
          "startSec": 36.427,
          "endSec": 36.973,
          "startFrame": 1093,
          "endFrame": 1109,
          "localStartFrame": 78,
          "localEndFrame": 94
        },
        {
          "word": "No",
          "startSec": 37.523,
          "endSec": 37.697,
          "startFrame": 1126,
          "endFrame": 1131,
          "localStartFrame": 111,
          "localEndFrame": 116
        },
        {
          "word": "noise,",
          "startSec": 37.79,
          "endSec": 38.196,
          "startFrame": 1134,
          "endFrame": 1146,
          "localStartFrame": 119,
          "localEndFrame": 131
        },
        {
          "word": "no",
          "startSec": 38.266,
          "endSec": 38.417,
          "startFrame": 1148,
          "endFrame": 1153,
          "localStartFrame": 133,
          "localEndFrame": 138
        },
        {
          "word": "waiting...",
          "startSec": 38.498,
          "endSec": 39.067,
          "startFrame": 1155,
          "endFrame": 1172,
          "localStartFrame": 140,
          "localEndFrame": 157
        }
      ],
      "startFrame": 1015,
      "endFrame": 1198,
      "durationInFrames": 183,
      "fullText": "UMak accounts only. Protected from spam. No noise, no waiting..."
    },
    {
      "id": "scene7",
      "name": "Outro",
      "words": [
        {
          "word": "just",
          "startSec": 40.017,
          "endSec": 40.284,
          "startFrame": 1201,
          "endFrame": 1209,
          "localStartFrame": 3,
          "localEndFrame": 11
        },
        {
          "word": "clarity.",
          "startSec": 40.331,
          "endSec": 41.039,
          "startFrame": 1210,
          "endFrame": 1231,
          "localStartFrame": 12,
          "localEndFrame": 33
        },
        {
          "word": "TAGA-asK",
          "startSec": 41.739,
          "endSec": 42.807,
          "startFrame": 1252,
          "endFrame": 1284,
          "localStartFrame": 54,
          "localEndFrame": 86
        },
        {
          "word": "AI.",
          "startSec": 42.888,
          "endSec": 43.422,
          "startFrame": 1287,
          "endFrame": 1303,
          "localStartFrame": 89,
          "localEndFrame": 105
        },
        {
          "word": "Ask",
          "startSec": 43.872,
          "endSec": 44.15,
          "startFrame": 1316,
          "endFrame": 1325,
          "localStartFrame": 118,
          "localEndFrame": 127
        },
        {
          "word": "smarter.",
          "startSec": 44.208,
          "endSec": 45.1896,
          "startFrame": 1326,
          "endFrame": 1356,
          "localStartFrame": 128,
          "localEndFrame": 158
        }
      ],
      "startFrame": 1198,
      "endFrame": 1431,
      "durationInFrames": 233,
      "fullText": "just clarity. TAGA-asK AI. Ask smarter."
    }
  ],
  "allWords": [
    {
      "word": "Campus",
      "startSec": 0.25,
      "endSec": 0.796,
      "startFrame": 8,
      "endFrame": 24
    },
    {
      "word": "life",
      "startSec": 0.865,
      "endSec": 1.202,
      "startFrame": 26,
      "endFrame": 36
    },
    {
      "word": "moves",
      "startSec": 1.272,
      "endSec": 1.597,
      "startFrame": 38,
      "endFrame": 48
    },
    {
      "word": "fast.",
      "startSec": 1.666,
      "endSec": 2.259,
      "startFrame": 50,
      "endFrame": 68
    },
    {
      "word": "Too",
      "startSec": 2.709,
      "endSec": 2.894,
      "startFrame": 81,
      "endFrame": 87
    },
    {
      "word": "fast",
      "startSec": 2.952,
      "endSec": 3.219,
      "startFrame": 89,
      "endFrame": 97
    },
    {
      "word": "to",
      "startSec": 3.254,
      "endSec": 3.312,
      "startFrame": 98,
      "endFrame": 99
    },
    {
      "word": "follow.",
      "startSec": 3.37,
      "endSec": 3.939,
      "startFrame": 101,
      "endFrame": 118
    },
    {
      "word": "Meet",
      "startSec": 4.839,
      "endSec": 5.083,
      "startFrame": 145,
      "endFrame": 152
    },
    {
      "word": "TAGA-asK",
      "startSec": 5.141,
      "endSec": 5.826,
      "startFrame": 154,
      "endFrame": 175
    },
    {
      "word": "AI.",
      "startSec": 5.895,
      "endSec": 6.604,
      "startFrame": 177,
      "endFrame": 198
    },
    {
      "word": "Schedules,",
      "startSec": 7.254,
      "endSec": 7.823,
      "startFrame": 218,
      "endFrame": 235
    },
    {
      "word": "rooms,",
      "startSec": 7.869,
      "endSec": 8.264,
      "startFrame": 236,
      "endFrame": 248
    },
    {
      "word": "policies...",
      "startSec": 8.299,
      "endSec": 8.949,
      "startFrame": 249,
      "endFrame": 268
    },
    {
      "word": "all",
      "startSec": 9.399,
      "endSec": 9.689,
      "startFrame": 282,
      "endFrame": 291
    },
    {
      "word": "scattered.",
      "startSec": 9.759,
      "endSec": 10.328,
      "startFrame": 293,
      "endFrame": 310
    },
    {
      "word": "All",
      "startSec": 10.878,
      "endSec": 11.11,
      "startFrame": 326,
      "endFrame": 333
    },
    {
      "word": "unclear.",
      "startSec": 11.203,
      "endSec": 11.9,
      "startFrame": 336,
      "endFrame": 357
    },
    {
      "word": "But",
      "startSec": 12.75,
      "endSec": 12.935,
      "startFrame": 383,
      "endFrame": 388
    },
    {
      "word": "what",
      "startSec": 12.982,
      "endSec": 13.156,
      "startFrame": 389,
      "endFrame": 395
    },
    {
      "word": "if",
      "startSec": 13.203,
      "endSec": 13.272,
      "startFrame": 396,
      "endFrame": 398
    },
    {
      "word": "every",
      "startSec": 13.33,
      "endSec": 13.539,
      "startFrame": 400,
      "endFrame": 406
    },
    {
      "word": "answer...",
      "startSec": 13.597,
      "endSec": 14.131,
      "startFrame": 408,
      "endFrame": 424
    },
    {
      "word": "just",
      "startSec": 14.511,
      "endSec": 14.709,
      "startFrame": 435,
      "endFrame": 441
    },
    {
      "word": "made",
      "startSec": 14.755,
      "endSec": 14.929,
      "startFrame": 443,
      "endFrame": 448
    },
    {
      "word": "sense?",
      "startSec": 14.964,
      "endSec": 15.44,
      "startFrame": 449,
      "endFrame": 463
    },
    {
      "word": "One",
      "startSec": 16.09,
      "endSec": 16.322,
      "startFrame": 483,
      "endFrame": 490
    },
    {
      "word": "place",
      "startSec": 16.357,
      "endSec": 16.624,
      "startFrame": 491,
      "endFrame": 499
    },
    {
      "word": "to",
      "startSec": 16.659,
      "endSec": 16.729,
      "startFrame": 500,
      "endFrame": 502
    },
    {
      "word": "ask,",
      "startSec": 16.845,
      "endSec": 17.286,
      "startFrame": 505,
      "endFrame": 519
    },
    {
      "word": "to",
      "startSec": 17.321,
      "endSec": 17.425,
      "startFrame": 520,
      "endFrame": 523
    },
    {
      "word": "verify,",
      "startSec": 17.495,
      "endSec": 18.122,
      "startFrame": 525,
      "endFrame": 544
    },
    {
      "word": "to",
      "startSec": 18.157,
      "endSec": 18.238,
      "startFrame": 545,
      "endFrame": 547
    },
    {
      "word": "understand.",
      "startSec": 18.319,
      "endSec": 19.213,
      "startFrame": 550,
      "endFrame": 576
    },
    {
      "word": "Ask:",
      "startSec": 19.963,
      "endSec": 20.497,
      "startFrame": 599,
      "endFrame": 615
    },
    {
      "word": "Where",
      "startSec": 20.671,
      "endSec": 20.926,
      "startFrame": 620,
      "endFrame": 628
    },
    {
      "word": "is",
      "startSec": 20.973,
      "endSec": 21.054,
      "startFrame": 629,
      "endFrame": 632
    },
    {
      "word": "the",
      "startSec": 21.112,
      "endSec": 21.182,
      "startFrame": 633,
      "endFrame": 635
    },
    {
      "word": "CIT?",
      "startSec": 21.229,
      "endSec": 22.007,
      "startFrame": 637,
      "endFrame": 660
    },
    {
      "word": "Second",
      "startSec": 22.657,
      "endSec": 22.97,
      "startFrame": 680,
      "endFrame": 689
    },
    {
      "word": "Floor,",
      "startSec": 23.017,
      "endSec": 23.434,
      "startFrame": 691,
      "endFrame": 703
    },
    {
      "word": "South",
      "startSec": 23.516,
      "endSec": 23.806,
      "startFrame": 705,
      "endFrame": 714
    },
    {
      "word": "Wing,",
      "startSec": 23.864,
      "endSec": 24.166,
      "startFrame": 716,
      "endFrame": 725
    },
    {
      "word": "Admin",
      "startSec": 24.224,
      "endSec": 24.63,
      "startFrame": 727,
      "endFrame": 739
    },
    {
      "word": "Building.",
      "startSec": 24.688,
      "endSec": 25.222,
      "startFrame": 741,
      "endFrame": 757
    },
    {
      "word": "Source",
      "startSec": 25.672,
      "endSec": 26.009,
      "startFrame": 770,
      "endFrame": 780
    },
    {
      "word": "03,",
      "startSec": 26.079,
      "endSec": 26.833,
      "startFrame": 782,
      "endFrame": 805
    },
    {
      "word": "page",
      "startSec": 26.88,
      "endSec": 27.182,
      "startFrame": 806,
      "endFrame": 815
    },
    {
      "word": "1.",
      "startSec": 27.228,
      "endSec": 27.658,
      "startFrame": 817,
      "endFrame": 830
    },
    {
      "word": "Upload",
      "startSec": 28.458,
      "endSec": 28.795,
      "startFrame": 854,
      "endFrame": 864
    },
    {
      "word": "a",
      "startSec": 28.83,
      "endSec": 28.853,
      "startFrame": 865,
      "endFrame": 866
    },
    {
      "word": "schedule,",
      "startSec": 28.888,
      "endSec": 29.387,
      "startFrame": 867,
      "endFrame": 882
    },
    {
      "word": "or",
      "startSec": 29.434,
      "endSec": 29.596,
      "startFrame": 883,
      "endFrame": 888
    },
    {
      "word": "a",
      "startSec": 29.643,
      "endSec": 29.666,
      "startFrame": 889,
      "endFrame": 890
    },
    {
      "word": "photo.",
      "startSec": 29.701,
      "endSec": 30.223,
      "startFrame": 891,
      "endFrame": 907
    },
    {
      "word": "Need",
      "startSec": 30.773,
      "endSec": 30.982,
      "startFrame": 923,
      "endFrame": 929
    },
    {
      "word": "directions?",
      "startSec": 31.017,
      "endSec": 31.76,
      "startFrame": 931,
      "endFrame": 953
    },
    {
      "word": "Open",
      "startSec": 31.934,
      "endSec": 32.201,
      "startFrame": 958,
      "endFrame": 966
    },
    {
      "word": "the",
      "startSec": 32.236,
      "endSec": 32.306,
      "startFrame": 967,
      "endFrame": 969
    },
    {
      "word": "campus",
      "startSec": 32.329,
      "endSec": 32.665,
      "startFrame": 970,
      "endFrame": 980
    },
    {
      "word": "map.",
      "startSec": 32.724,
      "endSec": 33.072,
      "startFrame": 982,
      "endFrame": 992
    },
    {
      "word": "UMak",
      "startSec": 33.922,
      "endSec": 34.328,
      "startFrame": 1018,
      "endFrame": 1030
    },
    {
      "word": "accounts",
      "startSec": 34.386,
      "endSec": 34.746,
      "startFrame": 1032,
      "endFrame": 1042
    },
    {
      "word": "only.",
      "startSec": 34.816,
      "endSec": 35.257,
      "startFrame": 1044,
      "endFrame": 1058
    },
    {
      "word": "Protected",
      "startSec": 35.707,
      "endSec": 36.195,
      "startFrame": 1071,
      "endFrame": 1086
    },
    {
      "word": "from",
      "startSec": 36.23,
      "endSec": 36.369,
      "startFrame": 1087,
      "endFrame": 1091
    },
    {
      "word": "spam.",
      "startSec": 36.427,
      "endSec": 36.973,
      "startFrame": 1093,
      "endFrame": 1109
    },
    {
      "word": "No",
      "startSec": 37.523,
      "endSec": 37.697,
      "startFrame": 1126,
      "endFrame": 1131
    },
    {
      "word": "noise,",
      "startSec": 37.79,
      "endSec": 38.196,
      "startFrame": 1134,
      "endFrame": 1146
    },
    {
      "word": "no",
      "startSec": 38.266,
      "endSec": 38.417,
      "startFrame": 1148,
      "endFrame": 1153
    },
    {
      "word": "waiting...",
      "startSec": 38.498,
      "endSec": 39.067,
      "startFrame": 1155,
      "endFrame": 1172
    },
    {
      "word": "just",
      "startSec": 40.017,
      "endSec": 40.284,
      "startFrame": 1201,
      "endFrame": 1209
    },
    {
      "word": "clarity.",
      "startSec": 40.331,
      "endSec": 41.039,
      "startFrame": 1210,
      "endFrame": 1231
    },
    {
      "word": "TAGA-asK",
      "startSec": 41.739,
      "endSec": 42.807,
      "startFrame": 1252,
      "endFrame": 1284
    },
    {
      "word": "AI.",
      "startSec": 42.888,
      "endSec": 43.422,
      "startFrame": 1287,
      "endFrame": 1303
    },
    {
      "word": "Ask",
      "startSec": 43.872,
      "endSec": 44.15,
      "startFrame": 1316,
      "endFrame": 1325
    },
    {
      "word": "smarter.",
      "startSec": 44.208,
      "endSec": 45.1896,
      "startFrame": 1326,
      "endFrame": 1356
    }
  ]
};
