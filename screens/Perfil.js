import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ScreenWrapper } from '../components';
import { useApp } from '../context';
import { supabase } from '../lib/Supabase';

export default function Perfil() {
  const navigation = useNavigation();
  const { colors, t, language } = useApp();

  const [petsCount, setPetsCount] = useState(0);
  const [memberSince, setMemberSince] = useState('');
  const [profileData, setProfileData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    foto_url: '',
  });

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

  const formatMemberSince = useCallback((rawDate) => {
    if (!rawDate) return '';
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return '';
    const locale = language === 'en' ? 'en-US' : 'es-MX';
    const formatted = date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [language]);

  const loadProfileData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      // Fecha de registro
      setMemberSince(formatMemberSince(user.created_at));

      // Datos del perfil desde tabla perfiles
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (perfil) {
        setProfileData({
          nombre: perfil.nombre || user.email || '',
          email: perfil.email || user.email || '',
          telefono: perfil.telefono || '',
          foto_url: perfil.foto_url || '',
        });
      } else {
        setProfileData({
          nombre: user.email || '',
          email: user.email || '',
          telefono: '',
          foto_url: '',
        });
      }

      // Conteo de mascotas desde Supabase
      const { count } = await supabase
        .from('mascotas')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setPetsCount(count || 0);
    } catch (err) {
      console.error('loadProfileData error:', err);
    }
  }, [formatMemberSince]);

  useFocusEffect(useCallback(() => { loadProfileData(); }, [loadProfileData]));

  const menuOptions = [
    { icon: 'person-outline', label: t.editProfile || 'Editar perfil', screen: 'EditarPerfil' },
    { icon: 'paw-outline', label: t.myPets || 'Mis mascotas', screen: 'Mascotas' },
    { icon: 'calendar-outline', label: t.myAppointments || 'Mis citas', screen: 'Calendario' },
    { icon: 'notifications-outline', label: t.notifications || 'Notificaciones', screen: 'Notificaciones' },
    { icon: 'settings-outline', label: t.settings || 'Configuracion', screen: 'Configuracion' },
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
          <View style={styles.heroGlowTop} />
          <View style={styles.heroGlowBottom} />
          <View style={styles.heroGlowAccent} />
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles-outline" size={12} color="#FFFFFF" />
            <Text style={styles.heroBadgeText}>4PetsCare</Text>
          </View>
          <View style={styles.heroAvatarRow}>
            <View style={styles.avatarOuterRing}>
              <View style={styles.avatarInnerRing}>
                <Image
                  source={{ uri: profileData.foto_url || 'https://i.pravatar.cc/150' }}
                  style={[styles.avatar, { borderColor: 'rgba(255,255,255,0.4)' }]}
                />
              </View>
            </View>
            <TouchableOpacity
              style={styles.editAvatarBtn}
              onPress={() => navigation.navigate('EditarPerfil')}
            >
              <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.heroName}>{profileData.nombre || t.myProfile || 'Mi perfil'}</Text>
          <Text style={styles.heroEmail}>{profileData.email}</Text>
          <View style={styles.pillRow}>
            <View style={styles.pill}>
              <Ionicons name="paw" size={13} color="#FFFFFF" />
              <Text style={styles.pillText}>{petsCount} {petsCount === 1 ? (t.petCountSingle || 'mascota') : (t.petCountPlural || 'mascotas')}</Text>
            </View>
            {memberSince ? (
              <View style={styles.pill}>
                <Ionicons name="calendar-outline" size={13} color="#FFFFFF" />
                <Text style={styles.pillText}>{t.since || 'Desde'} {memberSince}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── Datos de contacto ── */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.muted }]}>{t.contactInfoTitle || 'INFORMACION DE CONTACTO'}</Text>
          {profileData.telefono ? (
            <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
              <View style={[styles.infoIcon, { backgroundColor: `${theme.brandSoft}18` }]}>
                <Ionicons name="call-outline" size={18} color={theme.brandSoft} />
              </View>
              <View>
                <Text style={[styles.infoLabel, { color: theme.muted }]}>{t.phoneLabel || 'Telefono'}</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{profileData.telefono}</Text>
              </View>
            </View>
          ) : null}
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: `${theme.brandSoft}18` }]}>
              <Ionicons name="mail-outline" size={18} color={theme.brandSoft} />
            </View>
            <View>
              <Text style={[styles.infoLabel, { color: theme.muted }]}>{t.emailWord || 'Correo'}</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{profileData.email}</Text>
            </View>
          </View>
        </View>

        {/* ── Menú de opciones ── */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.muted }]}>{t.optionsTitle || 'OPCIONES'}</Text>
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
          <Text style={[styles.logoutText, { color: theme.danger }]}>{t.logout || 'Cerrar sesion'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 48 },
  hero: { alignItems: 'center', marginHorizontal: 16, marginTop: 10, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingTop: 36, paddingBottom: 32, paddingHorizontal: 24, overflow: 'hidden' },
  heroGlowTop: { position: 'absolute', top: -42, right: -24, width: 150, height: 150, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)' },
  heroGlowBottom: { position: 'absolute', bottom: -56, left: -22, width: 170, height: 170, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.12)' },
  heroGlowAccent: { position: 'absolute', top: 84, left: -40, width: 110, height: 110, borderRadius: 999, backgroundColor: 'rgba(255,127,90,0.25)' },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-end', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 10 },
  heroBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  heroAvatarRow: { position: 'relative', marginBottom: 14 },
  avatarOuterRing: { width: 112, height: 112, borderRadius: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.22)' },
  avatarInnerRing: { width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)' },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 3 },
  editAvatarBtn: { position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', paddingHorizontal: 7, paddingVertical: 6 },
  heroName: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },
  heroEmail: { fontSize: 13, color: 'rgba(255,255,255,0.84)', marginTop: 4, marginBottom: 14 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  pill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.23)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingVertical: 6, paddingHorizontal: 12, gap: 5 },
  pillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  section: { marginHorizontal: 16, marginTop: 16, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  infoIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  infoLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  infoValue: { fontSize: 14, fontWeight: '500', marginTop: 1 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginTop: 20, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5 },
  logoutText: { fontSize: 15, fontWeight: '600' },
});