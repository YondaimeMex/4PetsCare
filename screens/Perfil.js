import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ScreenWrapper, Card, Button } from '../components';
import { spacing, typography, borderRadius } from '../constants';
import { useApp } from '../context';

export default function Perfil() {
  const navigation = useNavigation();
  const { userData, colors, t } = useApp();

  // Datos adicionales (en una app real vendrían de una API)
  const additionalData = {
    petsCount: 2,
    memberSince: 'Enero 2024',
  };

  const menuOptions = [
    { icon: 'person-outline', label: t.editProfile, screen: 'EditarPerfil' },
    { icon: 'notifications-outline', label: t.notifications, screen: null },
    { icon: 'paw-outline', label: t.myPets, screen: 'Mascotas' },
    { icon: 'calendar-outline', label: t.myAppointments, screen: 'Calendario' },
    { icon: 'settings-outline', label: t.settings, screen: 'Configuracion' },
    { icon: 'help-circle-outline', label: t.help, screen: null },
  ];

  return (
    <ScreenWrapper showProfile={false}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Sección de perfil */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: userData.avatar }}
            style={[styles.avatar, { borderColor: colors.primary }]}
          />
          <Text style={[styles.userName, { color: colors.text }]}>{userData.name}</Text>
          <Text style={[styles.userEmail, { color: colors.textMuted }]}>{userData.email}</Text>

          <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{additionalData.petsCount}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>{t.pets}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{additionalData.memberSince}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>{t.memberSince}</Text>
            </View>
          </View>
        </View>

        {/* Información de contacto */}
        <Card title={t.information}>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={colors.textLight} />
            <Text style={[styles.infoText, { color: colors.text }]}>{userData.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={colors.textLight} />
            <Text style={[styles.infoText, { color: colors.text }]}>{userData.email}</Text>
          </View>
        </Card>

        {/* Opciones del menú */}
        <Card title={t.options}>
          {menuOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuOption, { borderBottomColor: colors.borderLight }]}
              onPress={() => option.screen && navigation.navigate(option.screen)}
            >
              <Ionicons name={option.icon} size={24} color={colors.primary} />
              <Text style={[styles.menuOptionText, { color: colors.text }]}>{option.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Botón de cerrar sesión */}
        <View style={styles.logoutContainer}>
          <Button
            title={t.logout}
            variant="outline"
            icon={<MaterialIcons name="logout" size={20} color={colors.danger} />}
            onPress={() => alert('Cerrar sesión')}
            style={[styles.logoutButton, { borderColor: colors.danger }]}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.md,
    borderWidth: 3,
  },
  userName: {
    ...typography.title,
  },
  userEmail: {
    ...typography.bodySmall,
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.subtitle,
  },
  statLabel: {
    ...typography.caption,
  },
  statDivider: {
    width: 1,
    marginHorizontal: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body,
    marginLeft: spacing.sm,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  menuOptionText: {
    ...typography.body,
    flex: 1,
    marginLeft: spacing.md,
  },
  logoutContainer: {
    marginTop: spacing.lg,
  },
  logoutButton: {},
});
