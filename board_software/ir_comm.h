/**
 * ir_comm.c 
 * Library for UART IR communications over a 38kHz 
 * carrier square-wave.
 *
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Kyle J. Temkin <ktemkin@binghamton.edu>
 * Copyright (c) 2014 Binghamton University
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

#ifndef __IR_COMM_H__
#define __IR_COMM_H__

#include <avr/io.h>
#include <avr/interrupt.h>

/**
 * Define the RecieveHandler type, which stores a pointer to a function which
 * should handle the recieved byte.
 */ 
typedef void (*RecieveHandler)(uint8_t);


/**
 * Prepares the microcontroller for UART communications
 * using an IR LED.
 */ 
void set_up_ir_comm();

/**
 * Non-blocking function which begins a process of repeatedly transmitting
 * a single value. This is driven by interrupts, and thus effecitvely runs
 * "in the background".
 */ 
void ir_start_continuously_transmitting(uint8_t value);

/**
 * Stops any transmission operations which are currently being performed
 * (e.g. start_continuously_transmitting). If the transmission is currently
 * transmitting a frame, transmission will be halted after that frame's stop bit.
 */ 
void ir_stop_transmitting();

/**
 * Registers a given function to act as a "recieve handler",
 * which will be called whenever a new byte of data has been
 * received over the IR channel.
 */ 
void register_receive_handler(RecieveHandler handler);

#endif
