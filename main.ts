enum ControllerButton {
    //% block="A"
    A = 0x01,
    //% block="B"
    B = 0x02,
    //% block="A+B"
    AB = 0x03,
    //% block="← left"
    Left = 0x04,
    //% block="←↑ left+up"
    LeftUp = 0x0c,
    //% block="↑ up"
    Up = 0x08,
    //% block="↑→ right+up"
    RightUp = 0x18,
    //% block="→ right"
    Right = 0x10,
    //% block="→↓ right+down"
    RightDown = 0x30,
    //% block="↓ down"
    Down = 0x20,
    //% block="←↓ left+down"
    LeftDown = 0x24
}

/**
 * Blocks to build custom arcade controller
 */
//% color=0xe95153 icon="\uf11b"
//% weight=80
//% blockNamespace="Maker Controller"
namespace makerController {
    const NBUTTONS = 6;
    /**
     * A MakeCode Arcade controller
     */
    //% fixedInstances
    export class Player {
        private downs: number;
        constructor(public keys: string) {
            this.downs = 0;
        }

        private static normalizeButtons(button: ControllerButton, down: boolean) {
            button = button & 0xff;
            // left/right cancel each other
            const leftRight = ControllerButton.Left | ControllerButton.Right;
            if (down && (button & leftRight) == leftRight)
                button = ~(~button | leftRight);
            // up/down cancel each other
            const upDown = ControllerButton.Left | ControllerButton.Right;
            if (down && (button & upDown) == upDown)
                button = ~(~button | upDown);
            return button;
        }

        /**
         * Simulate that the button has been pressed
         */
        //% blockId=makercontrollerpress block="press %this button %button"
        press(button: ControllerButton) {
            button = Player.normalizeButtons(button, true);
            this.setButtonDown(button, true);
            pause(5);
            this.setButtonDown(button, false);
        }

        /**
         * Sets a button state to down or up
         */
        //% blockId=makercontrollerkey block="set %this button %button to %down=toggleDownUp"
        //% down.defl=true
        setButtonDown(button: ControllerButton, down: boolean) {
            button = Player.normalizeButtons(button, down);
            if (down) {
                // send up commands
                const cup = button & ~this.downs;
                for (let i = 0; i < NBUTTONS; ++i) {
                    const ci = 1 << i;
                    if (cup & ci) // it's not down
                        keyboard.key(this.keys[i], KeyboardKeyEvent.Down)
                }
                // clear state
                this.downs |= button;
            } else {
                // send up commands
                const cdo = button & this.downs;
                for (let i = 0; i < NBUTTONS; ++i) {
                    const ci = 1 << i;
                    if (cdo & ci) // it's down
                        keyboard.key(this.keys[i], KeyboardKeyEvent.Up)
                }
                // clear state
                this.downs = ~(~this.downs | button);
            }
        }

        /**
         * Reset the state of all controller buttons
         */
        //% blockId=makercontrollerreset block="reset %this buttons"
        reset() {
            for (let i = 0; i < NBUTTONS; ++i) {
                const ci = 1 << i;
                if (this.downs & ci) // it's down
                    keyboard.key(this.keys[i], KeyboardKeyEvent.Up)
            }
            this.downs = 0;
        }
    }

    /**
     * Player 1 keys
     */
    //% fixedInstance whenUsed block="player 1"
    export const player1 = new Player("qeawds");

    /**
     * Player 2 keys
     */
    //% fixedInstance whenUsed block="player 2"
    export const player2 = new Player("uojilk");
}
