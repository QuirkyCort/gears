/**
 * GearsBot Autocomplete System for Ace Editor
 *
 * This module provides a lightweight, regex-based autocomplete system for Python code
 * within the GearsBot simulator. It detects the robotics library being used (ev3dev or pybricks),
 * parses variable assignments, and provides context-aware suggestions for methods and properties.
 */

const GearsBotCompleter = (function() {
    const ev3devLargeMotor = {
        methods: [
            { name: 'on', args: [{ name: 'speed' }, { name: 'brake', default: 'True' }, { name: 'block', default: 'False' }] },
            { name: 'on_for_degrees', args: [{ name: 'speed' }, { name: 'degrees' }, { name: 'brake', default: 'True' }, { name: 'block', default: 'True' }] },
            { name: 'on_for_rotations', args: [{ name: 'speed' }, { name: 'rotations' }, { name: 'brake', default: 'True' }, { name: 'block', default: 'True' }] },
            { name: 'on_for_seconds', args: [{ name: 'speed' }, { name: 'seconds' }, { name: 'brake', default: 'True' }, { name: 'block', default: 'True' }] },
            { name: 'run_timed', args: [{ name: 'time_sp' }, { name: 'speed_sp' }, { name: 'stop_action', default: "'hold'" }] },
            { name: 'run_forever', args: [{ name: 'speed_sp' }] },
            { name: 'run_to_abs_pos', args: [{ name: 'position_sp' }, { name: 'speed_sp' }, { name: 'stop_action', default: "'hold'" }] },
            { name: 'run_to_rel_pos', args: [{ name: 'position_sp' }, { name: 'speed_sp' }, { name: 'stop_action', default: "'hold'" }] },
            { name: 'run_direct', args: [{ name: 'duty_cycle_sp' }] },
            { name: 'stop', args: [{ name: 'stop_action', default: "'hold'" }] },
            { name: 'reset', args: [] }
        ],
        properties: [
            'address', 'speed', 'position', 'is_running', 'is_stalled'
        ]
    };

    const virtualSensors = {
        GPSSensor: {
            methods: [],
            properties: ['position', 'x', 'y', 'altitude']
        },
        LidarSensor: {
            methods: [
                { name: 'get_distances', args: [] }
            ],
            properties: []
        },
        CameraSensor: {
            methods: [
                { name: 'get_blobs', args: [] },
                { name: 'get_image_hsv', args: [] },
                { name: 'get_image_rgb', args: [] }
            ],
            properties: []
        },
        Pen: {
            methods: [
                { name: 'down', args: [] },
                { name: 'up', args: [] },
                { name: 'isDown', args: [] },
                { name: 'setColor', args: [{ name: 'r', default: 0.5 }, { name: 'g', default: 0.5 }, { name: 'b', default: 0.5 }] },
                { name: 'setWidth', args: [{ name: 'width', default: 1.0 }] }
            ],
            properties: []
        }
    };

    const ev3devMoveTank = {
        methods: [
            { name: 'on', args: [{ name: 'left_speed' }, { name: 'right_speed' }] },
            { name: 'on_for_rotations', args: [{ name: 'left_speed' }, { name: 'right_speed' }, { name: 'rotations' }, { name: 'brake', default: 'True' }, { name: 'block', default: 'True' }] },
            { name: 'on_for_degrees', args: [{ name: 'left_speed' }, { name: 'right_speed' }, { name: 'degrees' }, { name: 'brake', default: 'True' }, { name: 'block', default: 'True' }] },
            { name: 'on_for_seconds', args: [{ name: 'left_speed' }, { name: 'right_speed' }, { name: 'seconds' }, { name: 'brake', default: 'True' }, { name: 'block', default: 'True' }] },
            { name: 'off', args: [{ name: 'brake', default: 'True' }] },
            { name: 'stop', args: [{ name: 'brake', default: 'True' }] }
        ],
        properties: []
    };

    const ev3devMoveSteering = {
        methods: [
            { name: 'on', args: [{ name: 'steering' }, { name: 'speed' }] },
            { name: 'on_for_rotations', args: [{ name: 'steering' }, { name: 'speed' }, { name: 'rotations' }, { name: 'brake', default: 'True' }, { name: 'block', default: 'True' }] },
            { name: 'on_for_degrees', args: [{ name: 'steering' }, { name: 'speed' }, { name: 'degrees' }, { name: 'brake', default: 'True' }, { name: 'block', default: 'True' }] },
            { name: 'on_for_seconds', args: [{ name: 'steering' }, { name: 'speed' }, { name: 'seconds' }, { name: 'brake', default: 'True' }, { name: 'block', default: 'True' }] },
            { name: 'off', args: [{ name: 'brake', default: 'True' }] },
            { name: 'stop', args: [{ name: 'brake', default: 'True' }] }
        ],
        properties: []
    };

    const pybricksParameters = {
        Color: {
            isStatic: true,
            methods: [],
            properties: ['BLACK', 'BLUE', 'GREEN', 'YELLOW', 'RED', 'WHITE', 'BROWN', 'ORANGE', 'PURPLE']
        },
        Direction: {
            isStatic: true,
            methods: [],
            properties: ['CLOCKWISE', 'COUNTERCLOCKWISE']
        },
        Port: {
            isStatic: true,
            methods: [],
            properties: [
                'A', 'B', 'C', 'D',
                'S1', 'S2', 'S3', 'S4'
            ]
        },
        Stop: {
            isStatic: true,
            methods: [],
            properties: ['COAST', 'BRAKE', 'HOLD']
        },
        Button: {
            isStatic: true,
            methods: [],
            properties: ['UP', 'DOWN', 'LEFT', 'RIGHT', 'CENTER']
        }
    };

    const pybricksDevices = {
        Motor: {
            methods: [
                { name: 'speed', args: [] },
                { name: 'angle', args: [] },
                { name: 'reset_angle', args: [{ name: 'angle' }] },
                { name: 'stop', args: [] },
                { name: 'brake', args: [] },
                { name: 'hold', args: [] },
                { name: 'run', args: [{ name: 'speed' }] },
                { name: 'run_time', args: [{ name: 'speed' }, { name: 'time' }, { name: 'then', default: 'Stop.HOLD' }, { name: 'wait', default: 'True' }] },
                { name: 'run_angle', args: [{ name: 'speed' }, { name: 'rotation_angle' }, { name: 'then', default: 'Stop.HOLD' }, { name: 'wait', default: 'True' }] },
                { name: 'run_target', args: [{ name: 'speed' }, { name: 'target_angle' }, { name: 'then', default: 'Stop.HOLD' }, { name: 'wait', default: 'True' }] },
                { name: 'run_until_stalled', args: [{ name: 'speed' }, { name: 'then', default: 'Stop.COAST' }, { name: 'duty_limit', default: 'None' }] },
                { name: 'dc', args: [{ name: 'duty' }] },
                { name: 'track_target', args: [{ name: 'target_angle' }] }
            ],
            properties: []
        },
        TouchSensor: { methods: [{ name: 'pressed', args: [] }], properties: [] },
        ColorSensor: { methods: [{ name: 'color', args: [] }, { name: 'ambient', args: [] }, { name: 'reflection', args: [] }, { name: 'rgb', args: [] }, { name: 'hsv', args: [] }], properties: [] },
        UltrasonicSensor: { methods: [{ name: 'distance', args: [{ name: 'silent', default: 'False' }] }, { name: 'presence', args: [] }], properties: [] },
        GyroSensor: { methods: [{ name: 'speed', args: [] }, { name: 'angle', args: [] }, { name: 'reset_angle', args: [{ name: 'angle' }] }], properties: [] }
    };

    return {
        apiDefs: {
            standard: {
                math: {
                    isStatic: true,
                    methods: [
                        { name: 'sqrt', args: [{ name: 'x' }] },
                        { name: 'pow', args: [{ name: 'x' }, { name: 'y' }] },
                        { name: 'exp', args: [{ name: 'x' }] },
                        { name: 'log', args: [{ name: 'x' }, { name: 'base', default: 'e' }] },
                        { name: 'log10', args: [{ name: 'x' }] },
                        { name: 'fabs', args: [{ name: 'x' }] },
                        { name: 'ceil', args: [{ name: 'x' }] },
                        { name: 'floor', args: [{ name: 'x' }] },
                        { name: 'sin', args: [{ name: 'x' }] },
                        { name: 'cos', args: [{ name: 'x' }] },
                        { name: 'tan', args: [{ name: 'x' }] },
                        { name: 'asin', args: [{ name: 'x' }] },
                        { name: 'acos', args: [{ name: 'x' }] },
                        { name: 'atan', args: [{ name: 'x' }] },
                        { name: 'atan2', args: [{ name: 'y' }, { name: 'x' }] },
                        { name: 'degrees', args: [{ name: 'x' }] },
                        { name: 'radians', args: [{ name: 'x' }] },
                    ],
                    properties: [
                        'pi', 'e', 'tau', 'inf', 'nan'
                    ]
                },
                time: {
                    isStatic: true,
                    methods: [
                        { name: 'sleep', args: [{ name: 'secs' }] },
                        { name: 'time', args: [] }
                    ],
                    properties: []
                }
            },
            ev3dev: {
                LargeMotor: ev3devLargeMotor,
                MediumMotor: ev3devLargeMotor,
                MoveTank: ev3devMoveTank,
                MoveSteering: ev3devMoveSteering,
                Sound: {
                    methods: [
                        { name: 'beep', args: [] },
                        { name: 'play_tone', args: [{ name: 'frequency' }, { name: 'duration' }] },
                        { name: 'speak', args: [{ name: 'text' }] }
                    ],
                    properties: []
                },
                Button: {
                    methods: [],
                    properties: ['up', 'down', 'left', 'right', 'enter', 'backspace']
                },
                TouchSensor: { methods: [], properties: ['is_pressed'] },
                ColorSensor: { methods: [], properties: ['color', 'color_name', 'reflected_light_intensity'] },
                UltrasonicSensor: { methods: [], properties: ['distance_centimeters'] },
                GyroSensor: { methods: [{ name: 'reset', args: [] }], properties: ['angle'] },
                ...virtualSensors
            },
            pybricks: {
                ...pybricksParameters,
                ...pybricksDevices,
                ...virtualSensors,
                EV3Brick: {
                    methods: [],
                    properties: [
                        { name: 'speaker', type: 'EV3Brick.Speaker' },
                        { name: 'buttons', type: 'EV3Brick.Buttons' }
                    ]
                },
                'EV3Brick.Speaker': {
                    methods: [
                        { name: 'beep', args: [{ name: 'frequency', default: 500 }, { name: 'duration', default: 100 }] },
                        { name: 'say', args: [{ name: 'text' }] },
                        { name: 'set_volume', args: [{ name: 'volume' }, { name: 'which', default: "'_all_'" }] }
                    ],
                    properties: []
                },
                'EV3Brick.Buttons': {
                    methods: [
                        { name: 'pressed', args: [] }
                    ],
                    properties: []
                },
                DriveBase: {
                    methods: [
                        { name: 'straight', args: [{ name: 'distance' }] },
                        { name: 'turn', args: [{ name: 'angle' }] },
                        { name: 'settings', args: [{ name: 'straight_speed', default: 'None' }, { name: 'straight_acceleration', default: 'None' }, { name: 'turn_rate', default: 'None' }, { name: 'turn_acceleration', default: 'None' }] },
                        { name: 'drive', args: [{ name: 'drive_speed' }, { name: 'turn_rate' }] },
                        { name: 'stop', args: [] },
                        { name: 'distance', args: [] },
                        { name: 'angle', args: [] },
                        { name: 'state', args: [] },
                        { name: 'reset', args: [] }
                    ],
                    properties: []
                },
                wait: {
                    methods: [{ name: 'wait', args: [{ name: 'time' }] }],
                    properties: []
                },
            }
        },

    /**
     * Micro-parser to extract variable assignments and type hints.
     * @param {string} code - The Python code to parse.
     * @returns {Object} A symbol table mapping variable names to their types.
     */
    parseCodeForSymbols: function(code) {
        const symbolTable = {};
        const lines = code.split('\n');

        // Regex for `var = Type()`
        const assignmentRegex = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/;

        // Regex for `var: Type` or `var = ... # type: Type`
        const typeCommentRegex = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*[:=].*#\s*type:\s*([a-zA-Z_][a-zA-Z0-9_]*)/;

        for (const line of lines) {
            let match = line.match(assignmentRegex);
            if (match) {
                const varName = match[1];
                const typeName = match[2];
                symbolTable[varName] = typeName;
                continue;
            }

            match = line.match(typeCommentRegex);
            if (match) {
                const varName = match[1];
                const typeName = match[2];
                symbolTable[varName] = typeName;
            }
        }

        return symbolTable;
    },

    /**
     * Detects which robotics library is being used.
     * @param {string} code - The Python code to analyze.
     * @returns {string|null} 'ev3dev', 'pybricks', or null.
     */
    detectLibrary: function(code) {
        const lines = code.split('\n').slice(0, 30);

        for (const line of lines) {
            if (line.includes('from ev3dev2.')) {
                return 'ev3dev';
            }
            if (line.includes('from pybricks.')) {
                return 'pybricks';
            }
        }
        return 'pybricks'; // Default to pybricks if nothing is detected
    },

    /**
     * Generates autocomplete suggestions for a given type and library.
     * @param {string} typeName - The class name (e.g., "Motor").
     * @param {string} library - The detected library ('ev3dev' or 'pybricks').
     * @returns {Array} A list of Ace editor completion objects.
     */
    generateSuggestionsForType: function(typeName, library) {
        if (!this.apiDefs[library] || !this.apiDefs[library][typeName]) {
            return [];
        }

        const suggestions = [];
        const typeDef = this.apiDefs[library][typeName];

        // Properties
        if (typeDef.properties) {
            typeDef.properties.forEach(prop => {
                const propName = (typeof prop === 'string') ? prop : prop.name;
                suggestions.push({
                    caption: propName,
                    value: propName,
                    meta: "property",
                    score: 1000 // Higher score for properties
                });
            });
        }

        // Methods
        if (typeDef.methods) {
            typeDef.methods.forEach(method => {
                if (method.args.length === 0) {
                    // Method with no arguments
                    suggestions.push({
                        caption: `${method.name}()`,
                        snippet: `${method.name}()`,
                        meta: "method",
                        score: 900
                    });
                    return;
                }

                const positionalCaptionArgs = [];
                const keywordCaptionArgs = [];
                const positionalSnippetArgs = [];
                const keywordSnippetArgs = [];

                method.args.forEach((arg, i) => {
                    const argName = arg.name;
                    const argDefault = arg.default;
                    const tabStop = i + 1;

                    if (typeof argDefault !== 'undefined') {
                        // Optional argument
                        const captionPart = `${argName}=${argDefault}`;
                        positionalCaptionArgs.push(captionPart);
                        keywordCaptionArgs.push(captionPart);

                        const snippetPart = `${argName}=\${${tabStop}:${argDefault}}`;
                        positionalSnippetArgs.push(snippetPart);
                        keywordSnippetArgs.push(snippetPart);
                    } else {
                        // Required argument
                        positionalCaptionArgs.push(argName);
                        keywordCaptionArgs.push(`${argName}=...`);

                        positionalSnippetArgs.push(`\${${tabStop}:${argName}}`);
                        keywordSnippetArgs.push(`${argName}=\${${tabStop}}`);
                    }
                });

                // Suggestion with positional arguments
                suggestions.push({
                    caption: `${method.name}(${positionalCaptionArgs.join(', ')})`,
                    snippet: `${method.name}(${positionalSnippetArgs.join(', ')})`,
                    meta: "method",
                    score: 900
                });

                // Suggestion with keyword arguments
                suggestions.push({
                    caption: `${method.name}(${keywordCaptionArgs.join(', ')})`,
                    snippet: `${method.name}(${keywordSnippetArgs.join(', ')})`,
                    meta: "method",
                    score: 899 // Slightly lower score for keyword version
                });
            });
        }

        return suggestions;
    },

    /**
     * Ace-compatible completer object.
     */
    Completer: {
        getCompletions: function(editor, session, pos, prefix, callback) {
            const line = session.getLine(pos.row);
            const charBeforePrefix = line.charAt(pos.column - prefix.length - 1);

            if (charBeforePrefix !== '.') {
                callback(null, []);
                return;
            }

            // Find the full expression before the dot (e.g., "ev3.speaker")
            let dotPos = pos.column - prefix.length - 1;
            let i = dotPos - 1;
            // Allow dots in the expression
            while (i >= 0 && line[i].match(/[a-zA-Z0-9_.]/)) {
                i--;
            }
            const expression = line.substring(i + 1, dotPos);

            if (!expression) {
                callback(null, []);
                return;
            }

            const code = session.getValue();
            const symbolTable = GearsBotCompleter.parseCodeForSymbols(code);
            const library = GearsBotCompleter.detectLibrary(code);
            const api = GearsBotCompleter.apiDefs[library];
            const standardApi = GearsBotCompleter.apiDefs.standard;

            const parts = expression.split('.');
            const baseVar = parts[0];
            const props = parts.slice(1);

            let currentTypeName = symbolTable[baseVar];
            let currentApiDef = api;

            if (!currentTypeName) {
                if (api[baseVar] && api[baseVar].isStatic) {
                    currentTypeName = baseVar;
                } else if (standardApi[baseVar] && standardApi[baseVar].isStatic) {
                    currentTypeName = baseVar;
                    currentApiDef = standardApi;
                }
            }

            if (!currentTypeName) {
                callback(null, []);
                return;
            }

            // Traverse the property chain to find the final type
            let currentTypeDef = currentApiDef[currentTypeName];
            for (const propName of props) {
                if (!currentTypeDef || !currentTypeDef.properties) {
                    currentTypeName = null;
                    break;
                }

                const propDef = currentTypeDef.properties.find(p => typeof p === 'object' && p.name === propName);

                if (!propDef || !propDef.type) {
                    currentTypeName = null;
                    break;
                }
                currentTypeName = propDef.type;
                currentTypeDef = currentApiDef[currentTypeName];
            }

            let suggestions = [];
            if (currentTypeName) {
                const finalLibrary = (currentApiDef === api) ? library : 'standard';
                suggestions = GearsBotCompleter.generateSuggestionsForType(currentTypeName, finalLibrary);
            }

            callback(null, suggestions);
        }
    }
};
})();