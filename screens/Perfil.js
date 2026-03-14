import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrapper } from '../components';
import { useApp } from '../context';
import { supabase } from '../lib/Supabase';

export default function Perfil() {
  const navigation = useNavigation();
  const { userData, colors, t } = useApp();

  const [petsCount, setPetsCount] = useState(0);
  const [memberSince, setMemberSince] = useState('');

  const theme = useMemo(() => ({
    brand: colors?.primaryDark || '#2F6E4F',
    brandSoft: colors?.primary || '#43A047',
    accent: colors?.accent || '#FF7F5A',
    bg: colors?.backgroundLight || '#F6F8F4',
    card: colors?.background || '#FFFFFF',
    border: colors?.border || '#E4E9E5',
    text: colors?.text || '#22352D',
    muted: colors?.textMuted || '#5D6E64',
    danger: colors?.danger || '#E53935',
  }), [colors]);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('@mascotas').then(raw => {
        const arr = raw ? JSON.parse(raw) : [];
        setPetsCount(arr.length);
      }).catch(() => setPetsCount(0));

      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.created_at) {
          const date = new Date(user.created_at);
          const formatted = date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
          setMemberSince(formatted.charAt(0).toUpperCase() + formatted.slice(1));
        }
      }).catch(() => { });
    }, [])
  );

  const menuOptions = [
    { icon: 'person-outline', label: t.editProfile || 'Editar perfil', screen: 'EditarPerfil' },
    { icon: 'paw-outline', label: t.myPets || 'Mis mascotas', screen: 'Mascotas' },
    { icon: 'calendar-outline', label: t.myAppointments || 'Mis citas', screen: 'Calendario' },
    { icon: 'notifications-outline', label: t.notifications || 'Notificaciones', screen: 'Notificaciones' },
    { icon: 'settings-outline', label: t.settings || 'Configuración', screen: 'Configuracion' },
  ];

  return (
    <ScreenWrapper showProfile={false}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.bg }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <View style={[styles.hero, { backgroundColor: theme.brand }]}>
          <View style={styles.heroAvatarRow}>
            <Image
              source={{ uri: userData?.avatar || 'https://i.pravatar.cc/150' }}
              style={[styles.avatar, { borderColor: 'rgba(255,255,255,0.4)' }]}
            />
            <TouchableOpacity
              style={styles.editAvatarBtn}
              onPress={() => navigation.navigate('EditarPerfil')}
            >
              <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.heroName}>{userData?.name || 'Mi perfil'}</Text>
          <Text style={styles.heroEmail}>{userData?.email || ''}</Text>

          <View style={styles.pillRow}>
            <View style={styles.pill}>
              <Ionicons name="paw" size={13} color="#FFFFFF" />
              <Text style={styles.pillText}>{petsCount} {petsCount === 1 ? 'mascota' : 'mascotas'}</Text>
            </View>
            {memberSince ? (
              <View style={styles.pill}>
                <Ionicons name="calendar-outline" size={13} color="#FFFFFF" />
                <Text style={styles.pillText}>Desde {memberSince}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── Datos de contacto ── */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.muted }]}>INFORMACIÓN DE CONTACTO</Text>

          {userData?.phone ? (
            <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
              <View style={[styles.infoIcon, { backgroundColor: `${theme.brandSoft}18` }]}>
                <Ionicons name="call-outline" size={18} color={theme.brandSoft} />
              </View>
              <View>
                <Text style={[styles.infoLabel, { color: theme.muted }]}>Teléfono</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{userData.phone}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: `${theme.brandSoft}18` }]}>
              <Ionicons name="mail-outline" size={18} color={theme.brandSoft} />
            </View>
            <View>
              <Text style={[styles.infoLabel, { color: theme.muted }]}>Correo</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{userData?.email || '—'}</Text>
            </View>
          </View>
        </View>

        {/* ── Menú de opciones ── */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.muted }]}>OPCIONES</Text>
          {menuOptions.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.menuRow,
                { borderBottomColor: theme.border },
                i === menuOptions.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={() => opt.screen && navigation.navigate(opt.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${theme.brand}14` }]}>
                <Ionicons name={opt.icon} size={20} color={theme.brand} />
              </View>
              <Text style={[styles.menuLabel, { color: theme.text }]}>{opt.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.muted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Cerrar sesión ── */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: theme.danger }]}
          onPress={async () => { await supabase.auth.signOut(); }}
          activeOpacity={0.8}
        >
          <MaterialIcons name="logout" size={18} color={theme.danger} />
          <Text style={[styles.logoutText, { color: theme.danger }]}>
            {t.logout || 'Cerrar sesión'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 48,
  },
  /* Hero */
  hero: {
    alignItems: 'center',
    paddingTop: 36,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  heroAvatarRow: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    padding: 4,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  heroEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    marginBottom: 16,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 5,
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  /* Sections */
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  /* Info rows */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 1,
  },
  /* Menu rows */
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  /* Logout */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
  },
});