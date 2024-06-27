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
	import flash.media.SoundCodec;
	
	public class Settings
	{
		public static const SET_MICROPHONE:String = "setMicrophone";
		public static const SET_CAMERA:String = "setCamera";
		public static const SET_CODEC:String = "setCodec";
		public static const SET_SPEEX_QUALITY:String = "setSpeexQuality";
		public static const SET_NELLYMOSER_RATE:String = "setNellymoserRate";
		
		public var action:String = null;
		
		// default values for application
		public var microphoneIndex:int = -1;
		public var cameraIndex:int = 0;
		public var cameraWidth:int = 640;
		public var cameraHeight:int = 480;
		public var cameraFramerate:int = 10;
		public var cameraBandwidth:int = 0;
		public var cameraQuality:int = 80;
		public var codec:String = SoundCodec.NELLYMOSER;
		public var speexQuality:int = 10;
		public var nellymoserRate:int = 22;
		public var silenceLevel:int = 3;
		public var echoSuppression:Boolean = true;
		public var micGain:Number = 60;
	}
}