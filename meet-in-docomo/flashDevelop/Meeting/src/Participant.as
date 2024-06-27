/**
 * ADOBE SYSTEMS INCORPORATED
 * Copyright 2010 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file
 * in accordance with the terms of the license agreement accompanying it.
 * 
 * Author: Jozsef Vass
 */

package
{
	import flash.events.EventDispatcher;
	import flash.events.NetStatusEvent;
	import flash.media.SoundTransform;
	import flash.media.Video;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	import flash.net.NetStreamInfo;
	import flash.utils.Timer;
	import flash.events.TimerEvent;
	
	import mx.logging.ILogger;
	import flash.external.ExternalInterface;

	public class Participant extends EventDispatcher
	{
		public function Participant(nc:NetConnection, id:String, userName:String, targetUserId:int, protocol:String, self:Boolean, width:int, height:int):void
		{
			_id = id;
			_userName = userName;
			_targetUserId = targetUserId;
			_protocol = protocol;
			_netConnection = nc;
			_topology = SessionManager.MEDIA_NONE;
			_self = self;
			
			if (!self)
			{
				_video = new Video();
				_video.width = width;
				_video.height = height;
			}
		}
		
		public function get self():Boolean
		{
			return _self;
		}
		
		public function get protocol():String
		{
			return _protocol;
		}
		
		public function get id():String
		{
			return _id;
		}
		
		public function get userName():String
		{
			return _userName;
		}
		
		public function get video():Video
		{
			return _video;
		}
		
		public function set receiveAudio(receive:Boolean):void
		{
			_receiveAudio = receiveAudio;
			if (_netStream)
			{
				_netStream.receiveAudio(receive);
			}
		}
		
		public function get receiveAudio():Boolean
		{
			return _self ? false : _receiveAudio;
		}
		
		public function set receiveVideo(receive:Boolean):void
		{
			_receiveVideo = receiveVideo;
			if (_netStream)
			{
				_netStream.receiveVideo(receive);
			}
		}
		
		public function get receiveVideo():Boolean
		{
			return _self ? false : _receiveVideo;
		}
		
		public function get streamInfo():NetStreamInfo
		{
			if (_netStream)
			{
				return _netStream.info;
			}
			
			return null;
		}
		
		public function set topology(topology:String):void
		{
			_logger.debug("Participant: " + _userName + " changing: " + _topology + " -> " + topology);
			
			if (_topology != topology)
			{
				_topology = topology;
				
				if (_self)
				{
					return;
				}
				
				if (_netStream)
				{
					_logger.debug("Closing last stream...");
					_netStream.close();
					_netStream = null;
				}
				
				if (SessionManager.MEDIA_CS == topology)
				{
					_netStream = new NetStream(_netConnection);
				}
				else if (SessionManager.MEDIA_DIRECT == topology)
				{
					_netStream = new NetStream(_netConnection, _id);
				}
				
				_netStream.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
				_netStream.play(_userName);
				ExternalInterface.call("meetinFlashTargetVideo_debug", "Playing stream '"+_userName+"'");
				
				_video.attachNetStream(_netStream);
				ExternalInterface.call("meetinFlashTargetVideo_debug", "Attach stream '"+_netStream.toString()+"'");
			}
		}
		
		private function netStatusHandler(e:NetStatusEvent):void
		{
			_logger.debug("Participants: " + _userName + ": " + e.info.code);
			
			if ("NetStream.Play.Start" == e.info.code) {
				_needCheckStream = true;
			} else if ("NetStream.Video.DimensionChange" == e.info.code) {
				_needCheckStream = false;
				
				if (_checkStreamTimer)
				{
					_checkStreamTimer.stop();
					_checkStreamTimer = null;
					ExternalInterface.call("meetinFlashTargetVideo_debug", "_checkStreamTimer.stop");
				}
			}
			
			if ("NetStream.Video.DimensionChange" == e.info.code) {
				changeSize(_video.width, _video.height);
			}
			ExternalInterface.call("meetinFlashTargetVideo_netStatusHandler", e.info.code, _targetUserId);
		}
		
		public function checkStream():void {
			if (_needCheckStream) {
				_checkStreamTimer = new Timer(NeedCheckStreamTimeout, 1);
				_checkStreamTimer.addEventListener(TimerEvent.TIMER_COMPLETE, checkStreamTimeoutHandler);
				_checkStreamTimer.start();
				ExternalInterface.call("meetinFlashTargetVideo_debug", "checkStream");
			}
		}

		private function checkStreamTimeoutHandler(e:TimerEvent):void
		{
			if (_checkStreamTimer)
			{
				_checkStreamTimer.stop();
				_checkStreamTimer = null;
				ExternalInterface.call("meetinFlashTargetVideo_debug", "_checkStreamTimer.stop");
			}
			
			dispatchEvent(new ParticipantEvent(ParticipantEvent.NEED_RESET, this));
			ExternalInterface.call("meetinFlashTargetVideo_debug", "checkStreamTimeoutHandler");
		}

		public function changeSize(width:int, height:int):void {
			if (_video) {
//				_video = new Video();

				var aspect:Number = _video.videoWidth / _video.videoHeight;
				var aspect2:Number = width / height;
				var newWidth:int = width;
				var newHeight:int = height;
				
				if (aspect2 > aspect) {
					newHeight = width / aspect;
				} else if (aspect2 < aspect) {
					newWidth = height * aspect;
				}

				_video.width = newWidth;
				_video.height = newHeight;
//				_video.attachNetStream(_netStream);

//				trace("[changeSize] aspect = " + aspect + ", Video(" + _video.videoWidth + ", " + _video.videoHeight + ") -> View(" + newWidth + ", " + newHeight + ")");
			}
		}
		public function muteAudio(muted:Boolean):void
		{
			if (_netStream) {
				var st:SoundTransform = _netStream.soundTransform;
				if (muted == true) {
					st.volume = 0;
				} else {
					st.volume = 1;
				}
				_netStream.soundTransform = st;
			}
		}
		
		private const NeedCheckStreamTimeout:int = 3000;
		
		private var _protocol:String  = null;
		private var _userName:String = null;
		private var _id:String = null;
		private var _targetUserId:int = 0;
		
		// subscribing stream
		private var _netStream:NetStream = null;
		
		private var _netConnection:NetConnection = null;
		
		private var _video:Video = null;
		
		private var _topology:String;
		
		private var _receiveAudio:Boolean = true;
		private var _receiveVideo:Boolean = true;
		
		private var _self:Boolean = false;
		
		private var _needCheckStream:Boolean = false;
		private var _checkStreamTimer:Timer = null;
		
		private static const _logger:ILogger = Logger.getLogger("SessionManager");
	}
}