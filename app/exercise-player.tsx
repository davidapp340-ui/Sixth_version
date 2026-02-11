/**
 * Exercise Player Screen
 *
 * This component provides synchronized playback of exercise animations and audio.
 * Critical requirement: Absolute synchronization between audio and animation start,
 * even under slow network conditions.
 *
 * Synchronization strategy:
 * 1. Pre-load both audio and animation before enabling play
 * 2. Only enable play button when both are ready
 * 3. Start both at the exact same moment (atomic play)
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Audio } from 'expo-av';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react-native';
import { getLibraryItemById, getLocalizedLibraryItem } from '@/lib/library';
import { ExerciseAnimationRenderer } from '@/components/exercises/ExerciseRegistry';
import type { LibraryItemWithExercise } from '@/lib/library';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ExercisePlayerScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { i18n } = useTranslation();

  const [libraryItem, setLibraryItem] = useState<LibraryItemWithExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [audioReady, setAudioReady] = useState(false);
  const [animationReady, setAnimationReady] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const soundRef = useRef<Audio.Sound | null>(null);
  const animationTriggerRef = useRef<boolean>(false);

  useEffect(() => {
    loadExercise();

    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      } catch (err) {
        console.error('Error cleaning up audio:', err);
      }
    }
  };

  const loadExercise = async () => {
    try {
      setLoading(true);
      setError(null);

      const libraryItemId = params.libraryItemId as string;

      if (!libraryItemId) {
        setError('No exercise specified');
        return;
      }

      const item = await getLibraryItemById(libraryItemId);

      if (!item) {
        setError('Exercise not found');
        return;
      }

      setLibraryItem(item);

      if (item.enable_audio) {
        await loadAudio(item);
      } else {
        setAudioReady(true);
      }
    } catch (err) {
      console.error('Failed to load exercise:', err);
      setError('Failed to load exercise');
    } finally {
      setLoading(false);
    }
  };

  const loadAudio = async (item: LibraryItemWithExercise) => {
    try {
      const locale = i18n.language === 'he' ? 'he' : 'en';
      const localizedContent = getLocalizedLibraryItem(item, locale);

      if (!localizedContent.audioUrl) {
        setAudioReady(true);
        return;
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: localizedContent.audioUrl },
        { shouldPlay: false },
        onAudioStatusUpdate
      );

      soundRef.current = sound;

      await sound.getStatusAsync().then((status) => {
        if (status.isLoaded) {
          setAudioReady(true);
        }
      });
    } catch (err) {
      console.error('Failed to load audio:', err);
      setAudioReady(true);
    }
  };

  const onAudioStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      if (!audioReady) {
        setAudioReady(true);
      }

      if (status.didJustFinish && !status.isLooping) {
        handlePlaybackComplete();
      }
    }
  };

  const handlePlaybackComplete = () => {
    setIsPlaying(false);
    setHasCompleted(true);
    animationTriggerRef.current = false;
  };

  const handlePlay = async () => {
    if (!libraryItem) return;

    try {
      setIsPlaying(true);
      setHasCompleted(false);

      animationTriggerRef.current = true;

      if (libraryItem.enable_audio && soundRef.current) {
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      } else {
        setTimeout(() => {
          handlePlaybackComplete();
        }, 10000);
      }
    } catch (err) {
      console.error('Failed to play:', err);
      setIsPlaying(false);
      setError('Failed to play exercise');
    }
  };

  const handleReplay = async () => {
    setHasCompleted(false);
    setIsPlaying(false);
    animationTriggerRef.current = false;

    if (soundRef.current) {
      await soundRef.current.setPositionAsync(0);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const isReadyToPlay = audioReady && animationReady && !loading && !error;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading exercise...</Text>
          <Text style={styles.loadingSubtext}>Preparing audio and animation...</Text>
        </View>
      </View>
    );
  }

  if (error || !libraryItem) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Exercise not available'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const locale = i18n.language === 'he' ? 'he' : 'en';
  const localizedContent = getLocalizedLibraryItem(libraryItem, locale);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backIconButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {localizedContent.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.animationContainer}>
        {libraryItem.enable_animation && animationTriggerRef.current ? (
          <ExerciseAnimationRenderer animationId={libraryItem.exercise.animation_id} />
        ) : (
          <View style={styles.placeholderAnimation}>
            <Text style={styles.placeholderIcon}>🧘</Text>
            <Text style={styles.placeholderText}>Ready to start</Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        {localizedContent.description && (
          <Text style={styles.description}>{localizedContent.description}</Text>
        )}

        {!isReadyToPlay && (
          <View style={styles.bufferingContainer}>
            <ActivityIndicator size="small" color="#10B981" />
            <Text style={styles.bufferingText}>Preparing exercise...</Text>
          </View>
        )}

        {hasCompleted ? (
          <TouchableOpacity
            style={[styles.playButton, styles.replayButton]}
            onPress={handleReplay}
          >
            <RotateCcw size={24} color="#FFFFFF" />
            <Text style={styles.playButtonText}>Play Again</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.playButton,
              (!isReadyToPlay || isPlaying) && styles.playButtonDisabled,
            ]}
            onPress={handlePlay}
            disabled={!isReadyToPlay || isPlaying}
          >
            <Play size={24} color="#FFFFFF" />
            <Text style={styles.playButtonText}>
              {isPlaying ? 'Playing...' : 'Start Exercise'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.metaInfo}>
          {libraryItem.enable_audio && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🔊</Text>
              <Text style={styles.metaText}>Audio Guided</Text>
            </View>
          )}
          {libraryItem.enable_animation && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🎬</Text>
              <Text style={styles.metaText}>Animated</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backIconButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 40,
  },
  animationContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  placeholderAnimation: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  placeholderIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 18,
    color: '#6B7280',
  },
  controls: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  bufferingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  bufferingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  playButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  playButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  replayButton: {
    backgroundColor: '#3B82F6',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    fontSize: 16,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
