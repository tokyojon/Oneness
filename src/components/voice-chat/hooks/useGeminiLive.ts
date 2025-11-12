import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface VoiceMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ConnectionState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  error: string | null;
}

export function useGeminiLive() {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    error: null,
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const genAIRef = useRef<GoogleGenerativeAI | null>(null);
  const modelRef = useRef<any>(null);
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const connect = useCallback(async () => {
    if (!apiKey) {
      setConnectionState(prev => ({ ...prev, error: 'Gemini API key not found' }));
      return;
    }

    try {
      setConnectionState(prev => ({ ...prev, error: null }));
      
      genAIRef.current = new GoogleGenerativeAI(apiKey);
      modelRef.current = genAIRef.current.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      setConnectionState(prev => ({ ...prev, isConnected: true }));
      
    } catch (error: any) {
      console.error('Failed to initialize Gemini:', error);
      setConnectionState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to connect',
        isConnected: false 
      }));
    }
  }, [apiKey]);

  const disconnect = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    genAIRef.current = null;
    modelRef.current = null;
    
    setConnectionState({
      isConnected: false,
      isListening: false,
      isSpeaking: false,
      error: null,
    });
  }, []);

  const transcribeAudio = useCallback(async (audioBlob: Blob): Promise<string> => {
    // For now, return a placeholder since we don't have a speech-to-text service
    // In a real implementation, you would use Web Speech API or a service like Google Speech-to-Text
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("音声入力を受け付けました"); // Placeholder text
      }, 1000);
    });
  }, []);

  const startListening = useCallback(async () => {
    if (!modelRef.current || !connectionState.isConnected) {
      setConnectionState(prev => ({ ...prev, error: 'Not connected to Gemini' }));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio context for visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunks.length > 0) {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          
          try {
            // Transcribe audio (placeholder)
            const transcribedText = await transcribeAudio(audioBlob);
            addMessage(transcribedText, true);
            
            // Get response from Gemini
            const result = await modelRef.current.generateContent(transcribedText);
            const response = await result.response;
            const responseText = response.text();
            
            addMessage(responseText, false);
            
            // In a real implementation, you would convert the response text to speech
            // For now, we'll just mark as speaking briefly
            setConnectionState(prev => ({ ...prev, isSpeaking: true }));
            setTimeout(() => {
              setConnectionState(prev => ({ ...prev, isSpeaking: false }));
            }, 2000);
            
          } catch (error) {
            console.error('Error processing audio:', error);
            setConnectionState(prev => ({ 
              ...prev, 
              error: 'Failed to process audio' 
            }));
          }
        }
      };

      mediaRecorder.start();
      setConnectionState(prev => ({ ...prev, isListening: true }));
      
    } catch (error: any) {
      console.error('Failed to start listening:', error);
      setConnectionState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to access microphone',
        isListening: false 
      }));
    }
  }, [connectionState.isConnected, transcribeAudio]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setConnectionState(prev => ({ ...prev, isListening: false }));
  }, []);

  const addMessage = useCallback((text: string, isUser: boolean) => {
    const newMessage: VoiceMessage = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    messages,
    connectionState,
    connect,
    disconnect,
    startListening,
    stopListening,
    clearMessages,
    analyser: analyserRef.current,
  };
}
