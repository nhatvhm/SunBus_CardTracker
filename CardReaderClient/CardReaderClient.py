#TODO: Create TCP connection, then hang up the connection.
#TODO: Create UDP connection to the same port.

import socket	
import sys		
import time
import datetime
import logging
import os
import signal
import threading
import errno
import json

#Path configuration
LOG_DIR = './' #'/mnt/scripts/log'
DB_DIR = '/mnt/scripts/db'
DEVICE_PATH = '/dev/ttyUSB3'

DEVICE_HOST = '192.168.1.201'
DEVICE_PORT = 4370
UDP_TIMEOUT = 2.003
PING_TIMEOUT = 4.007
BUFFER_SIZE = 1024
TCP_DELAY = 0.013
UDP_DELAY = 0.137

TCP_SOCKET = None
UDP_SOCKET = None
STOP_FLAG = False

class HEADER_MODE:
    #MODENAME = [CODE, send_as_ascii, receive_as_ascii]
    CONNECT = ["e803", False, False]			#03e8
    RECEIVED = ["d007", True, True]				#07d0
    SEND = ["0b00", True, True]				    #000b
    DISCONNECT = ["e903", False, False]			#03e9
    UNKNOWN0 = ["4500", False, False]			#0045
    GETPROTOCOL = ["4c04", False, True]			#044c
    CARD_RECV = ["f401", False, False]			#01f4
    UNKNOWN3 = ["3200", False, False]			#0032
    DBDL_START = ["eb03", False, False]			#03eb
    DBDL_GETUSR = ["df05", False, False]		#05df
    DBDL_ONDATA = ["dd05", False, False]		#05dd
    DBDL_END = ["ea03", False, False]			#03ea
    DBUL_USR = ["0800", False, False]           #0008
    DBUL_UNKNOWN1 = ["1600", False, False]      #0016
    DBUL_UNKNOWN2 = ["1800", False, False]      #0018
    DBUL_UNKNOWN3 = ["4f00", False, False]      #004f
    DBUL_END = ["f503", False, False]           #03f5

class CARD_RECV:
	ID_NOT_IN_DB = "80000000"					#00008000
	RECV_ID = "00040000"					    #00000004
	ID_IN_DB = "01000000"					    #00000100
	UNKNOWN0 = "00020000"					    #00000002
GLOBAL_COUNTER = 0
CHKSUM_PADDING = "0000"
SESSION_KEY = "0000"
RECV_CARD_ID = "00000000"

DEVICE_OPTION = {}
USR_DATA = {}

def tohex(val, nbits):
	return hex((val + (1 << nbits)) % (1 << nbits))

def checksum(bytestr, b):
	sum = 0
	for i in range(0, len(bytestr) / 2):
		sum += int(bytestr[i * 2:i * 2 + 2], 16)
	#print tohex(sum, 16)
	#print str(tohex(~sum + 1, 16))[2:]
	#print long(tohex(~sum + 1, b * 8), 16)
	return long(tohex(~sum - 121, b * 8), 16)
	
def invert_data(old):
	#00 00 CA 68 -> 68 CA 00 00
	#Why linux
	ans = ""
	for i in range(0, len(old) / 2):
		a = -i * 2 - 2
		b = -i * 2 if -i * 2 < 0 else None
		#print(old[a:b])
		ans += old[a:b]
	return ans
	
def str_to_pad_hex(s, b):
	tmp = ""
	for i in range(0, len(s)):
		tmp += num_to_pad_hex(ord(s[i]), 1)
	for i in range(len(s), b):
		tmp += num_to_pad_hex(ord("\0"), 1)
	return tmp[:b * 2]

def float_to_hex(f):
    return invert_data(hex(struct.unpack('<I', struct.pack('<f', f))[0])[2:])

def double_to_hex(f):
    return invert_data(hex(struct.unpack('<Q', struct.pack('<d', f))[0])[2:-1])

def num_to_hex(n, b): 
	return "{0:#0{1}x}".format(n, b + 2)
	
def num_to_pad_hex(n, b):
	return invert_data(num_to_hex(n,b * 2)[2:b * 2 + 2])

def get_now():
	return datetime.datetime.now()

def apply_chksum(bytestr):
	#print bytestr
	sum = 0
	for i in range(0, len(bytestr) / 4):
		#print bytestr[i*4:i*4+4]
		#print invert_data(bytestr[i*4:i*4+4])
		sum += int(invert_data(bytestr[i * 4:i * 4 + 4]),16)
	chksum = num_to_pad_hex(65535 - (sum / 65536) - (sum % 65536), 2)
	#log('debug', chksum)
	return bytestr[0:4] + chksum + bytestr[8:]

def make_packet(mode, body, ascii):
	counter_temp = 0 if mode == HEADER_MODE.RECEIVED[0] else GLOBAL_COUNTER 
	body = "" if mode == HEADER_MODE.RECEIVED[0] else body
	return make_packet(mode, str_to_pad_hex(body, len(body) + 1), False) if ascii else apply_chksum(mode + CHKSUM_PADDING + SESSION_KEY + num_to_pad_hex(counter_temp, 2) + body)

def parse_card_from_db(card_id, str):
	try:
		ac_id = int(invert_data(str[0:8]), 16)
		machine_id = int(invert_data(str[8:12]), 16)
		year = 2000 + int(str[12:14], 16)
		month = int(str[14:16], 16)
		day = int(str[16:18], 16)
		hour = int(str[18:20], 16)
		minute = int(str[20:22], 16)
		second = int(str[22:24], 16)
		timestamp = datetime.datetime(year, month, day, hour, minute, second).strftime('%Y-%m-%d %H:%M:%S')
		
		return json.dumps({'CARD_RECV': {'card_id': card_id, 'ac_id': ac_id, 'machine_id': machine_id, 'timestamp': timestamp}})
	except:
		return "Card ID " + RECV_CARD_ID + " reconized in DB: " + str

def parse_usr_data_from_db(str):
    #print str
    try:
        global USR_DATA
        USR_DATA['packet_length'] = int(invert_data(str[0:8]), 16)
        USR_DATA['usr_arr'] = []
        #Dynamic length handling instead of fixed length
        #Data need further observation
        i = 8;
        #print len(str)
        #print [i, len(str),  (i < len(str))]
        while (i < len(str)):
            ac_id_device = int(invert_data(str[i+0:i+4]), 16)   #hex[4]
            ac_type = int(invert_data(str[i+4:i+8]), 16)        #000e = supervisor, 0000 = user
            gender = str[i+8:i+16]                              #b8280510 = male, b8180be0 = female
            name_str = ""                                       #char[8]
            for j in range(i/2 + 8, i/2 + 16):
                if int(str[j * 2:j * 2 + 2], 16) is 0: break
                name_str += chr(int(str[j * 2:j * 2 + 2], 16))
            card_id = str[i+32:i+40]                            #hex[8]
            machine_id = int(invert_data(str[i+40:i+48]), 16)   #00000001
            ac_id_server = int(invert_data(str[i+48:i+56]), 16) #hex[8]
            USR_DATA['usr_arr'].append({'ac_id_device': ac_id_device, 'ac_type': ac_type, 'gender': gender, 'name': name_str, 'card_id': card_id, 'machine_id': machine_id, 'ac_id_server': ac_id_server})
            i = i + 56
           
        return json.dumps({'USR_DATA': USR_DATA})
    except:
        return ("Error when parsing USR_DATA: " + str)

def parse_response(res):
    global RECV_CARD_ID
    res_str = ""
    try:
        if (res[0:4] == HEADER_MODE.RECEIVED[0]):
            if (len(res) < 16) : return res_str
            for i in range(8, len(res) / 2):
                res_str += chr(int(res[i * 2:i * 2 + 2], 16))
            global SESSION_KEY
            SESSION_KEY = res[8:12]
            arr = res_str.split('=')
            if (len(arr) > 1):
                global DEVICE_OPTION
                arr[1] = arr[1][:-1]
                #log('debug', str(len(arr[1])))
                DEVICE_OPTION[arr[0]] = arr[1]
            #log('debug', "SESSION_KEY = " + SESSION_KEY)
        elif (res[0:4] == HEADER_MODE.CARD_RECV[0]):
            if (len(res) < 16) : return res_str
            if (res[8:16] == CARD_RECV.ID_NOT_IN_DB):
                res_str += "Card ID " + RECV_CARD_ID + " not reconized in loacl DB."
            elif (res[8:16] == CARD_RECV.RECV_ID):
                RECV_CARD_ID = res[16:]
                res_str += "Received Card ID = " + RECV_CARD_ID
            elif (res[8:16] == CARD_RECV.ID_IN_DB):
                #str += "Card ID " + RECV_CARD_ID + " reconized in DB: " + res[16:]
                res_str += parse_card_from_db(RECV_CARD_ID, res[16:])
            elif (res[8:16] == CARD_RECV.UNKNOWN0):
                res_str += "Card ID " + RECV_CARD_ID + " UNKNOWN0: " + res[16:]
            else:
                res_str += "Unhandled packet: " + res
        elif (res[0:4] == HEADER_MODE.DBDL_ONDATA[0]):
            if (len(res) < 16) : return res_str
            elif (len(res) >= 20) : res_str += parse_usr_data_from_db(res[16:])
            else: res_str += "Unhandled packet: " + res
        else:
            res_str += "Unhandled packet: " + res
        return res_str
    except:
        print_error()
    return str

#Too much debug information, better make some layered logging
class bcolors:
	HEADER = '\033[95m'
	OKBLUE = '\033[94m'
	OKGREEN = '\033[92m'
	WARNING = '\033[93m'
	FAIL = '\033[91m'
	ENDC = '\033[0m'
	BOLD = '\033[1m'
	UNDERLINE = '\033[4m'

def log(lvl, msg):
	if (lvl == "info") : 
		print (get_now().isoformat() + ' - ' + bcolors.OKGREEN + "Info :" + bcolors.ENDC + " " + msg)
		logging.info(msg)
	elif (lvl == "debug") : 
		print (get_now().isoformat() + ' - ' + bcolors.OKBLUE + "Debug:" + bcolors.ENDC + " " + msg)
		logging.debug(msg)
	elif (lvl == "warn") : 
		print (get_now().isoformat() + ' - ' + bcolors.WARNING + "Warn :" + bcolors.ENDC + " " + msg)
		logging.debug(msg)
	elif (lvl == "error") : 
		print (get_now().isoformat() + ' - ' + bcolors.FAIL + "Error:" + bcolors.ENDC + " " + msg)
		logging.error(msg)
	else : return #msg
	return
#End of logging methods

def print_error():
	log('error', get_now().isoformat() + ": " + str(sys.exc_info()[0]) + " " + str(sys.exc_info()[1]))
	#exc_type, exc_value, exc_traceback = sys.exc_info()
	#traceback.print_exception(exc_type, exc_value, exc_traceback, limit=10,
	#file=sys.stdout)

def hang_tcp():
	global TCP_SOCKET 
	try:
		TCP_SOCKET = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		TCP_SOCKET.connect((DEVICE_HOST, DEVICE_PORT))
	except socket.error:
		time.sleep(TCP_DELAY)
	except:
		print_error()
		sys.exit()
	return

def create_udp():
	global UDP_SOCKET
	try:
		UDP_SOCKET = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
	except:
		print_error()
		sys.exit()
	return

# send and receive message
def send_receive_udp(mode, msg): 
	def func_wrapper(mode, msg):
		#msg = raw_input('Enter message to send : ')
		#log('debug', "send: " + msg)
		try :
			msg = make_packet(mode[0], msg, mode[1])
			UDP_SOCKET.sendto(msg.decode("hex"), (DEVICE_HOST, DEVICE_PORT))
			UDP_SOCKET.settimeout(UDP_TIMEOUT)
			if (mode == HEADER_MODE.RECEIVED): 
				#log('info', "SENDING RECEIVED...")
				return
			global GLOBAL_COUNTER
			GLOBAL_COUNTER += 1

			d = UDP_SOCKET.recvfrom(BUFFER_SIZE)
			reply = d[0]
			addr = d[1]
			if (len(d) >= 2): 
				res_b = "".join("{:02x}".format(ord(c)) for c in reply)
				res_c = "" if len(reply) <= 8 else " ".join("{:02x}".format(ord(c)) for c in reply[8:])
				res_str = parse_response(res_b)
				#if len(res_str) > 0: log("info", res_str if mode[2] else res_c)
				#if len(res_str) == 0: log("info", "Unhandled binary:" + res_c)
			else: 
				log("error", "No response")
		except socket.error, e:
			if e.args[0] == errno.EWOULDBLOCK: 
				print 'Blocked. Retrying...'
				time.sleep(UDP_DELAY)
				return func_wrapper(mode, msg)
		except :
			print_error()
		return
	t = threading.Thread(target = func_wrapper, args=(mode,msg))
	t.daemon = True
	t.start()
	time.sleep(UDP_DELAY)

def start_init_session():
	send_receive_udp(HEADER_MODE.CONNECT, "")
	log('info', "Session Started!")
	global UDP_SOCKET
	UDP_SOCKET.setblocking(0)
	send_receive_udp(HEADER_MODE.GETPROTOCOL, "")
	send_receive_udp(HEADER_MODE.SEND, "~OS")
	send_receive_udp(HEADER_MODE.SEND, "~ExtendFmt")
	send_receive_udp(HEADER_MODE.SEND, "ExtendOPLog")
	send_receive_udp(HEADER_MODE.SEND, "~Platform")
	send_receive_udp(HEADER_MODE.SEND, "~ZKFPVersion")
	send_receive_udp(HEADER_MODE.UNKNOWN0, "5810")
	send_receive_udp(HEADER_MODE.SEND, "WorkCode")
	send_receive_udp(HEADER_MODE.SEND, "~SSR")
	send_receive_udp(HEADER_MODE.SEND, "~PIN2Width")
	send_receive_udp(HEADER_MODE.SEND, "FaceFunOn")
	send_receive_udp(HEADER_MODE.SEND, "~UserExtFmt")
	send_receive_udp(HEADER_MODE.SEND, "~Platform")
	send_receive_udp(HEADER_MODE.SEND, "BuildVersion")
	send_receive_udp(HEADER_MODE.SEND, "AttPhotoForSDK")
	send_receive_udp(HEADER_MODE.SEND, "~IsOnlyRFMachine")
	send_receive_udp(HEADER_MODE.SEND, "CameraOpen")
	send_receive_udp(HEADER_MODE.SEND, "Compat OldFirmware")
	send_receive_udp(HEADER_MODE.SEND, "IsSuportPull")
	send_receive_udp(HEADER_MODE.SEND, "Language")
	send_receive_udp(HEADER_MODE.SEND, "~SerialNumber")
	send_receive_udp(HEADER_MODE.SEND, "~DeviceName")
	send_receive_udp(HEADER_MODE.CARD_RECV, "ffff0000")
	send_receive_udp(HEADER_MODE.UNKNOWN3, "")
	send_receive_udp(HEADER_MODE.SEND, "DeviceID")
	log('info', json.dumps({'DEVICE_OPTION': DEVICE_OPTION}))

def stop_session():
	send_receive_udp(HEADER_MODE.DISCONNECT, "")
	log('info', "Session Stopped!")

def start_download_session():
	send_receive_udp(HEADER_MODE.DBDL_START, "e8030000")
	send_receive_udp(HEADER_MODE.DBDL_GETUSR, "0109000500000000000000")
	send_receive_udp(HEADER_MODE.DBDL_END, "")
	log('info', json.dumps({'USR_DATA': USR_DATA}))

def start_upload_session():
    send_receive_udp(HEADER_MODE.DBDL_START, "e8030000")
    send_receive_udp(HEADER_MODE.DBDL_GETUSR, "0109000500000000000000")
    for i in range(0,1):
        send_receive_udp(HEADER_MODE.DBUL_USR, "39050000b82805807e7e7e7e7e7e7e7e8804fead0001000039050000")
        send_receive_udp(HEADER_MODE.DBUL_UNKNOWN1, "3905" + "000001")
        send_receive_udp(HEADER_MODE.DBUL_UNKNOWN2, "3905" + "000000000000000000000000000000000000")
        send_receive_udp(HEADER_MODE.DBUL_UNKNOWN3, "3905" + "00000000000000000000000000000000000000000000")
    send_receive_udp(HEADER_MODE.DBUL_END, "")
    send_receive_udp(HEADER_MODE.DBDL_END, "")

def make_ping():
	#log('debug', "make_ping()")
	try:
		UDP_SOCKET.settimeout(UDP_TIMEOUT)
		d = UDP_SOCKET.recvfrom(BUFFER_SIZE)
		reply = d[0]
		addr = d[1]
		if (len(d) >= 2): 
			res_b = "".join("{:02x}".format(ord(c)) for c in reply)
			#print res_b
			res_c = "" if len(reply) <= 8 else " ".join("{:02x}".format(ord(c)) for c in reply[8:])
			log("info", parse_response(res_b))
			#global SESSION_KEY
			#SESSION_KEY = res_b[8:12]
			send_receive_udp(HEADER_MODE.RECEIVED, "")
			make_ping()
		else: 
			log("error", "No response")
	except socket.timeout:
		#log('debug', "CHKPT0")
		send_receive_udp(HEADER_MODE.SEND, "DeviceID")
	except:
		log('debug', "CHKPT1")
		print_error()
	return

def set_interval(func, sec):
	if STOP_FLAG: return None
	def func_wrapper():
		set_interval(func, sec)
		func()
	t = threading.Timer(sec, func_wrapper)
	t.daemon = True
	t.start()
	return t

def make_thread_init():
	thread = threading.Thread(target = start_init_session)
	thread.daemon = True
	thread.start()

def make_thread_download():
	thread = threading.Thread(target = start_download_session)
	thread.daemon = True
	thread.start()

def make_thread_upload():
	thread = threading.Thread(target = start_upload_session)
	thread.daemon = True
	thread.start()

def chkdir(dir):
	if not os.path.exists(dir): 
		os.makedirs(dir)
    #print dir + 'has been created!'
    #log('info', dir + ' has been created!')

def check_dir():
    #print 'Checking file directory...'
    #log('info', 'Checking file directory...')
    chkdir(LOG_DIR)
    chkdir(DB_DIR)
    return

def prepare_exit():
	global STOP_FLAG
	global PING_INTERVAL
	STOP_FLAG = True
	if PING_INTERVAL is not None: PING_INTERVAL.cancel()
	stop_session()
	return

def signal_handler(signal, frame):
	log('info', '[signal_handler] You pressed Ctrl+C!')
	prepare_exit()
	sys.exit(0)

if __name__ == "__main__":
    try:
        check_dir()
    except:
        print str(sys.exc_info()[0]) + " " + str(sys.exc_info()[1]) 
        sys.exit(1)

    logging.basicConfig(filename=LOG_DIR + '/udp_rev.log', level=logging.DEBUG, format='%(asctime)s %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')
    log("info", "[UDP_REV] Process start at " + get_now().isoformat() + " with pid " + str(os.getpid()))
    hang_tcp()				# create stream tcp socket
    create_udp()			# create dgram udp socket
    #start_init_session()
    make_thread_init()
    PING_INTERVAL = set_interval(make_ping, PING_TIMEOUT)
    signal.signal(signal.SIGINT, signal_handler)
    #stop_session()
    time.sleep(10)
    log("debug", "Before Uploading:")
    make_thread_upload()
    time.sleep(10)
    log("debug", "After Uploading:")
    make_thread_download()

    while STOP_FLAG is False:
        time.sleep(1)