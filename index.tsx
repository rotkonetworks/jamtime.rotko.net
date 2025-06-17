import { render } from 'solid-js/web';
import { createSignal, createEffect, onCleanup } from 'solid-js';
import '@unocss/reset/tailwind.css';
import 'uno.css';
import JAMTime from 'jamtime';

function App() {
  const [slot, setSlot] = createSignal(0);
  const [progress, setProgress] = createSignal(0);
  const [timeToNext, setTimeToNext] = createSignal(0);
  const [input, setInput] = createSignal('');
  const [output, setOutput] = createSignal('');

  createEffect(() => {
    const update = () => {
      setSlot(JAMTime.getCurrentTimeslot());
      const nextTime = JAMTime.getTimeToNextSlot();
      setTimeToNext(nextTime);
      setProgress(((6 - nextTime) / 6) * 100);
    };

    update();
    const timer = setInterval(update, 60);
    onCleanup(() => clearInterval(timer));
  });

  const executeCommand = () => {
    const cmd = input().trim();
    if (!cmd) return;

    let result = '';

    if (cmd === 'help') {
      result = `Available commands:
> help          - Show this help
> current       - Show current slot info
> unix <time>   - Convert unix timestamp to JAM slot
> slot <number> - Convert JAM slot to unix timestamp
> time <date>   - Convert date string to JAM slot
> install       - Show installation and usage guide
> clear         - Clear output`;
    } else if (cmd === 'install') {
      result = `JAMTime - JavaScript library for JAM Common Era timing

Installation:
npm install jamtime
# or
bun add jamtime

Usage:
import JAMTime from 'jamtime';

// Get current timeslot
const slot = JAMTime.getCurrentTimeslot();

// Convert timestamps
const unix = JAMTime.timeslotToUnix(slot);
const backToSlot = JAMTime.unixToTimeslot(unix);

// Get detailed time info
const info = JAMTime.getTimeInfo(slot);

API Methods:
• getCurrentTimeslot() - Current JAM timeslot
• unixToTimeslot(unix) - Convert Unix timestamp to timeslot
• timeslotToUnix(slot) - Convert timeslot to Unix timestamp
• getTimeInfo(slot) - Get detailed time information

Constants:
• JAM_COMMON_ERA: 1735732800 (Jan 1, 2025 12:00 UTC)
• SLOT_DURATION: 6 seconds per slot
• EPOCH_LENGTH: 600 slots per epoch

More info: https://www.npmjs.com/package/jamtime`;
    } else if (cmd === 'current') {
      const current = JAMTime.getCurrentTimeslot();
      const info = JAMTime.getTimeInfo(current);
      result = `Current JAM Slot: ${current.toLocaleString()}
Epoch: ${info.epoch.toLocaleString()}
Slot in Epoch: ${info.slotInEpoch}
Unix Timestamp: ${info.unixTimestamp}
Date: ${info.localDate}
Time to next slot: ${JAMTime.getTimeToNextSlot().toFixed(2)}s`;
    } else if (cmd === 'clear') {
      setOutput('');
      setInput('');
      return;
    } else if (cmd.startsWith('unix ')) {
      const unixTime = parseInt(cmd.split(' ')[1]);
      if (isNaN(unixTime)) {
        result = 'Error: Invalid unix timestamp';
      } else {
        const jamSlot = JAMTime.unixToTimeslot(unixTime);
        const info = JAMTime.getTimeInfo(jamSlot);
        result = `Unix ${unixTime} → JAM Slot ${jamSlot.toLocaleString()}
Epoch: ${info.epoch.toLocaleString()}
Slot in Epoch: ${info.slotInEpoch}
Date: ${info.localDate}`;
      }
    } else if (cmd.startsWith('slot ')) {
      const jamSlot = parseInt(cmd.split(' ')[1]);
      if (isNaN(jamSlot)) {
        result = 'Error: Invalid slot number';
      } else {
        const info = JAMTime.getTimeInfo(jamSlot);
        result = `JAM Slot ${jamSlot.toLocaleString()} → Unix ${info.unixTimestamp}
Epoch: ${info.epoch.toLocaleString()}
Slot in Epoch: ${info.slotInEpoch}
Date: ${info.localDate}
Is Future: ${info.isFuture}`;
      }
    } else if (cmd.startsWith('time ')) {
      const dateStr = cmd.substring(5);
      try {
        const date = new Date(dateStr);
        const unixTime = Math.floor(date.getTime() / 1000);
        const jamSlot = JAMTime.unixToTimeslot(unixTime);
        const info = JAMTime.getTimeInfo(jamSlot);
        result = `"${dateStr}" → JAM Slot ${jamSlot.toLocaleString()}
Unix: ${unixTime}
Epoch: ${info.epoch.toLocaleString()}
Slot in Epoch: ${info.slotInEpoch}`;
      } catch (e) {
        result = 'Error: Invalid date format';
      }
    } else {
      result = `Unknown command: ${cmd}
Type 'help' for available commands`;
    }

    setOutput(prev => prev + `\n> ${cmd}\n${result}\n`);
    setInput('');
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand();
    }
  };

  return (
    <div class="min-h-screen bg-black text-pink-400 font-mono p-4">
      <div class="max-w-4xl mx-auto">
        <div class="mb-6">
          <h1 class="text-2xl font-bold mb-2">
            <span class="text-gray-200">JAM</span>
            <span class="text-pink-400">Time</span>
          </h1>
          <div class="text-sm text-gray-500">
            Clock for JAM Common Era • Type 'help' for commands
          </div>
        </div>

        <div class="border border-pink-400/30 p-4 mb-6 bg-black/50">
          <div class="text-center space-y-4">
            <div class="text-4xl font-bold">
              <span class="text-pink-400">{slot().toLocaleString()}</span>
            </div>
            
            <div class="w-full h-1 bg-gray-800 rounded overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-pink-400 to-cyan-400 transition-all duration-75"
                style={{ width: `${progress()}%` }}
              />
            </div>
            
            <div class="grid grid-cols-3 gap-4 text-xs">
              <div>
                <div class="text-gray-500">Epoch</div>
                <div class="text-green-400">{JAMTime.getEpoch(slot()).toLocaleString()}</div>
              </div>
              <div>
                <div class="text-gray-500">SlotInEpoch</div>
                <div class="text-cyan-400">{JAMTime.getSlotInEpoch(slot())}</div>
              </div>
              <div>
                <div class="text-gray-500">Next Slot (s)</div>
                <div class="text-pink-400 font-bold">{timeToNext().toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="border border-pink-400/30 bg-black/70 h-96 flex flex-col">
          <div class="flex-1 p-4 overflow-y-auto text-sm whitespace-pre-wrap scrollbar-hide" ref={(el) => {
            // Auto-scroll to bottom when output changes
            createEffect(() => {
              if (output() && el) {
                el.scrollTop = el.scrollHeight;
              }
            });
          }}>
            <div class="text-green-400">JAMTime Terminal v1.0.0</div>
            <div class="text-gray-500">JAM Common Era: January 1, 2025 12:00 UTC</div>
            <div class="text-gray-500">Type 'help' for available commands</div>
            {output() && <div class="text-pink-400">{output()}</div>}
          </div>
          
          <div class="border-t border-pink-400/30 p-4 flex items-center">
            <span class="text-pink-400 mr-2">$</span>
            <input
              type="text"
              class="flex-1 bg-transparent text-pink-400 outline-none placeholder-gray-600"
              placeholder="Enter command..."
              value={input()}
              onInput={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              autofocus
            />
          </div>
        </div>

        <div class="mt-6 text-center text-xs text-gray-600">
          <div>npm install jamtime</div>
          <div class="mt-1">
            <a href="https://rotko.net" target="_blank" class="text-green-400 hover:text-green-300 transition-colors">rotko networks</a>
          </div>
        </div>
      </div>
    </div>
  );
}

render(() => <App />, document.getElementById('root')!);
