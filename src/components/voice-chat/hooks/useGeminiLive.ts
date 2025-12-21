import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, MediaResolution, Modality, TurnCoverage } from '@google/genai';

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

  const sessionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const genAIRef = useRef<GoogleGenAI | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const responseQueueRef = useRef<any[]>([]);
  const connectionStateRef = useRef(connectionState);

  useEffect(() => {
    connectionStateRef.current = connectionState;
  }, [connectionState]);

  const connect = useCallback(async () => {
    if (!apiKey) {
      setConnectionState(prev => ({ ...prev, error: 'Gemini API key not found' }));
      return;
    }

    try {
      setConnectionState(prev => ({ ...prev, error: null }));

      genAIRef.current = new GoogleGenAI({ apiKey });

      const config = {
        responseModalities: [Modality.AUDIO],
        mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Sulafat',
            },
          },
        },
        realtimeInputConfig: {
          turnCoverage: TurnCoverage.TURN_INCLUDES_ALL_INPUT,
        },
        systemInstruction: {
          parts: [
            {
              text: `はい、承知いたしました！ その日本語訳です。
「私の名前はZenith（ゼニス）です。（エネルギッシュで、「ワンネス」の最高点を意味します。）短く「Zennie（ゼニー）」と呼んでください！」
you respond in Japanese unless asked to speak in other languages`,
            },
          ],
        },
        conversation: {
          history: [],
        },
      };

      sessionRef.current = await genAIRef.current.live.connect({
        model: "models/gemini-2.5-flash-native-audio-preview-09-2025",
        config,
        callbacks: {
          onopen: () => {
            console.log('Gemini Live session opened');
            setConnectionState(prev => ({ ...prev, isConnected: true }));
            // Send initial start event so the model begins the voice session
            sessionRef.current?.sendClientContent({
              turns: ['こんにちは。会話を始めましょう。'],
            });
          },
          onmessage: (message: any) => {
            console.log('Received message:', message);
            responseQueueRef.current.push(message);

            if (message.serverContent && message.serverContent.modelTurn) {
              const modelTurn = message.serverContent.modelTurn;

              if (modelTurn.parts) {
                for (const part of modelTurn.parts) {
                  if (part.text) {
                    addMessage(part.text, false);
                  }

                  if (part.inlineData && part.inlineData.data) {
                    // Play audio response
                    playAudioResponse(part.inlineData.data);
                  }
                }
              }
            }
          },
          onerror: (error: any) => {
            console.error('Gemini Live session error:', error);
            setConnectionState(prev => ({
              ...prev,
              error: error.message || 'Connection error',
              isConnected: false
            }));
          },
          onclose: () => {
            console.log('Gemini Live session closed');
            setConnectionState(prev => ({ ...prev, isConnected: false }));
            stopListening();
          },
        },
      });

    } catch (error: any) {
      console.error('Failed to connect to Gemini Live:', error);
      setConnectionState(prev => ({
        ...prev,
        error: error.message || 'Failed to connect',
        isConnected: false
      }));
    }
  }, [apiKey]);

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    genAIRef.current = null;
    responseQueueRef.current = [];

    setConnectionState({
      isConnected: false,
      isListening: false,
      isSpeaking: false,
      error: null,
    });
  }, []);

  const convertAudioToBase64 = useCallback(async (audioBlob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get base64
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
  }, []);

  const startListening = useCallback(async () => {
    if (!sessionRef.current || !connectionState.isConnected) {
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

      const mimeType = 'audio/webm;codecs=opus';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current = mediaRecorder;
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && sessionRef.current && connectionStateRef.current.isConnected) {
          audioChunks.push(event.data);

          // Convert audio chunk to base64 and send to Gemini
          try {
            const base64Audio = await convertAudioToBase64(event.data);

            sessionRef.current.sendRealtimeInput({
              audio: {
                data: base64Audio,
                mimeType,
              }
            });
          } catch (error) {
            console.error('Error sending audio to Gemini:', error);
          }
        }
      };

      mediaRecorder.start(1000); // Send audio chunks every second
      setConnectionState(prev => ({ ...prev, isListening: true }));
      
    } catch (error: any) {
      console.error('Failed to start listening:', error);
      setConnectionState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to access microphone',
        isListening: false 
      }));
    }
  }, [connectionState.isConnected, convertAudioToBase64]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setConnectionState(prev => ({ ...prev, isListening: false }));
  }, []);

  const playAudioResponse = useCallback(async (base64Audio: string) => {
    try {
      setConnectionState(prev => ({ ...prev, isSpeaking: true }));
      
      const audioBytes = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0));
      const audioBlob = new Blob([audioBytes], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setConnectionState(prev => ({ ...prev, isSpeaking: false }));
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error) {
      console.error('Failed to play audio:', error);
      setConnectionState(prev => ({ ...prev, isSpeaking: false }));
    }
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
