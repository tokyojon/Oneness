'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Phone, PhoneOff, MessageCircle, X, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGeminiLive } from './hooks/useGeminiLive';

interface FloatingVoiceChatProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'small' | 'medium' | 'large';
}

export function FloatingVoiceChat({ 
  position = 'bottom-right', 
  size = 'medium' 
}: FloatingVoiceChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const { toast } = useToast();
  
  const {
    messages,
    connectionState,
    connect,
    disconnect,
    startListening,
    stopListening,
    clearMessages,
    analyser,
  } = useGeminiLive();

  // Position classes
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6',
  };

  // Size classes
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-14 h-14',
    large: 'w-16 h-16',
  };

  // Audio visualization
  useEffect(() => {
    if (!analyser || !isOpen || isMinimized) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = 'rgb(17, 24, 39)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.7;
        
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, connectionState.isListening ? '#ef4444' : '#3b82f6');
        gradient.addColorStop(1, connectionState.isListening ? '#dc2626' : '#2563eb');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isOpen, isMinimized, connectionState.isListening]);

  const handleConnect = async () => {
    try {
      await connect();
      toast({
        title: '接続中',
        description: 'Gemini Live APIに接続しています...',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '接続エラー',
        description: '音声アシスタントに接続できませんでした。',
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: '切断しました',
      description: '音声アシスタントとの接続を終了しました。',
    });
  };

  const handleToggleListening = () => {
    if (connectionState.isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isOpen) {
    return (
      <div className={positionClasses[position]}>
        <Button
          onClick={() => setIsOpen(true)}
          className={`${sizeClasses[size]} rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90`}
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`${positionClasses[position]} z-50`}>
      <Card className="w-80 shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              音声アシスタント
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">
                {connectionState.isConnected ? '接続済み' : '未接続'}
              </span>
              <div className={`w-2 h-2 rounded-full ${
                connectionState.isConnected ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>

            {/* Audio Visualization */}
            {connectionState.isConnected && (
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={280}
                  height={60}
                  className="w-full h-16 rounded-lg bg-muted"
                />
                {connectionState.isListening && (
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs text-red-500">録音中</span>
                    </div>
                  </div>
                )}
                {connectionState.isSpeaking && (
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-xs text-blue-500">応答中</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            {messages.length > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-2 p-2 rounded-lg bg-muted/30">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`text-sm p-2 rounded ${
                      message.isUser 
                        ? 'bg-primary/20 ml-8' 
                        : 'bg-secondary/20 mr-8'
                    }`}
                  >
                    <div className="font-medium text-xs mb-1">
                      {message.isUser ? 'あなた' : 'アシスタント'}
                    </div>
                    <div>{message.text}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Error Display */}
            {connectionState.error && (
              <div className="p-2 rounded-lg bg-destructive/10 text-destructive text-sm">
                {connectionState.error}
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-2">
              {!connectionState.isConnected ? (
                <Button
                  onClick={handleConnect}
                  className="flex-1"
                  disabled={!process.env.NEXT_PUBLIC_GEMINI_API_KEY}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  接続
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleToggleListening}
                    variant={connectionState.isListening ? 'destructive' : 'default'}
                    className="flex-1"
                  >
                    {connectionState.isListening ? (
                      <>
                        <MicOff className="w-4 h-4 mr-2" />
                        停止
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        録音
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleDisconnect}
                    variant="outline"
                    size="icon"
                  >
                    <PhoneOff className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Clear Messages */}
            {messages.length > 0 && (
              <Button
                onClick={clearMessages}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                履歴をクリア
              </Button>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
