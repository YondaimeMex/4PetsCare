import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useApp } from '../../context';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const HIGHLIGHT_PADDING = 10;

export default function TutorialOverlay() {
    const {
        isTutorialVisible,
        tutorialStepIndex,
        tutorialSteps,
        tutorialTargets,
        tutorialViewport,
        nextTutorialStep,
        previousTutorialStep,
        skipTutorial,
        colors,
        t,
    } = useApp();

    const step = tutorialSteps[tutorialStepIndex];
    const target = step?.targetKey ? tutorialTargets[step.targetKey] : null;
    const viewportWidth = tutorialViewport?.width || WINDOW_WIDTH;
    const viewportHeight = tutorialViewport?.height || WINDOW_HEIGHT;

    const theme = useMemo(() => ({
        brand: colors?.primaryDark || '#2F6E4F',
        card: colors?.background || '#FFFFFF',
        text: colors?.text || '#22352D',
        muted: colors?.textMuted || '#5D6E64',
    }), [colors]);

    const hole = useMemo(() => {
        if (!target) return null;

        const x = Math.max(0, target.x - HIGHLIGHT_PADDING);
        const y = Math.max(0, target.y - HIGHLIGHT_PADDING);
        const width = Math.max(20, target.width + HIGHLIGHT_PADDING * 2);
        const height = Math.max(20, target.height + HIGHLIGHT_PADDING * 2);

        return {
            x,
            y,
            width,
            height,
            right: viewportWidth - (x + width),
            bottom: viewportHeight - (y + height),
        };
    }, [target, viewportHeight, viewportWidth]);

    const tooltipPosition = useMemo(() => {
        if (!hole) {
            return {
                top: Math.round(viewportHeight * 0.62),
                left: 16,
                right: 16,
            };
        }

        const showBelow = hole.y < viewportHeight * 0.5;
        if (showBelow) {
            return {
                top: Math.min(hole.y + hole.height + 14, viewportHeight - 220),
                left: 16,
                right: 16,
            };
        }

        return {
            top: undefined,
            bottom: Math.max(hole.bottom + hole.height + 14, 24),
            left: 16,
            right: 16,
        };
    }, [hole, viewportHeight]);

    if (!isTutorialVisible || !step) return null;

    return (
        <View pointerEvents="box-none" style={styles.container}>
            {hole ? (
                <>
                    <View style={[styles.scrim, { left: 0, right: 0, top: 0, height: hole.y }]} />
                    <View style={[styles.scrim, { left: 0, width: hole.x, top: hole.y, height: hole.height }]} />
                    <View style={[styles.scrim, { right: 0, width: Math.max(0, hole.right), top: hole.y, height: hole.height }]} />
                    <View style={[styles.scrim, { left: 0, right: 0, top: hole.y + hole.height, bottom: 0 }]} />
                    <View
                        pointerEvents="none"
                        style={[
                            styles.highlight,
                            {
                                left: hole.x,
                                top: hole.y,
                                width: hole.width,
                                height: hole.height,
                                borderColor: '#FFFFFF',
                            },
                        ]}
                    />
                </>
            ) : (
                <View style={[styles.scrim, styles.scrimFull]} />
            )}

            <View style={[styles.tooltipCard, tooltipPosition, { backgroundColor: theme.card }]}>
                <Text style={[styles.stepText, { color: theme.muted }]}>
                    {(t.tutorialStepLabel || 'Paso')} {tutorialStepIndex + 1}/{tutorialSteps.length}
                </Text>
                <Text style={[styles.title, { color: theme.text }]}>{step.title}</Text>
                <Text style={[styles.description, { color: theme.muted }]}>{step.description}</Text>

                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.skipBtn} onPress={skipTutorial}>
                        <Text style={[styles.skipText, { color: theme.muted }]}>{t.tutorialSkip || 'Omitir'}</Text>
                    </TouchableOpacity>

                    <View style={styles.rightActions}>
                        {tutorialStepIndex > 0 ? (
                            <TouchableOpacity style={styles.secondaryBtn} onPress={previousTutorialStep}>
                                <Text style={[styles.secondaryBtnText, { color: theme.text }]}>{t.tutorialBack || 'Atras'}</Text>
                            </TouchableOpacity>
                        ) : null}

                        <TouchableOpacity
                            style={[styles.primaryBtn, { backgroundColor: theme.brand }]}
                            onPress={nextTutorialStep}
                        >
                            <Text style={styles.primaryBtnText}>
                                {tutorialStepIndex === tutorialSteps.length - 1
                                    ? (t.tutorialFinish || 'Finalizar')
                                    : (t.tutorialNext || 'Siguiente')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 60,
        elevation: 60,
    },
    scrim: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.62)',
    },
    scrimFull: {
        ...StyleSheet.absoluteFillObject,
    },
    highlight: {
        position: 'absolute',
        borderRadius: 14,
        borderWidth: 2,
    },
    tooltipCard: {
        position: 'absolute',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 9,
        elevation: 9,
    },
    stepText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    title: {
        marginTop: 6,
        fontSize: 17,
        fontWeight: '800',
    },
    description: {
        marginTop: 7,
        fontSize: 14,
        lineHeight: 20,
    },
    actionsRow: {
        marginTop: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    skipBtn: {
        paddingVertical: 8,
        paddingRight: 8,
    },
    skipText: {
        fontSize: 13,
        fontWeight: '700',
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    secondaryBtn: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.06)',
    },
    secondaryBtnText: {
        fontSize: 13,
        fontWeight: '700',
    },
    primaryBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    primaryBtnText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '800',
    },
});
