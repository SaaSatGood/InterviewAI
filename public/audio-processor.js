class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 4096;
        this._buffer = new Float32Array(this.bufferSize);
        this._bytesWritten = 0;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];

        if (!input || !input.length) return true;

        const inputChannel = input[0];

        // Append to buffer
        for (let i = 0; i < inputChannel.length; i++) {
            this._buffer[this._bytesWritten++] = inputChannel[i];

            // When buffer is full, flush
            if (this._bytesWritten >= this.bufferSize) {
                this.flush();
            }
        }

        return true;
    }

    flush() {
        // Send buffer to main thread
        this.port.postMessage({
            event: 'audio',
            buffer: this._buffer.slice(0, this._bytesWritten)
        });

        this._bytesWritten = 0;
    }
}

registerProcessor('audio-processor', AudioProcessor);
