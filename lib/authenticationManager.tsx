import { supabase } from './supabaseClient';
import { Session, User } from '@supabase/supabase-js';

/**
 * Check if user has a valid session
 * @returns Session object if valid, null otherwise
 */
export const checkSession = async (): Promise<Session | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error checking session:', error.message);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error in checkSession:', error);
    return null;
  }
};

/**
 * Get current authenticated user
 * @returns User object if authenticated, null otherwise
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting user:', error.message);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

/**
 * Sign in with email and password
 * @param email User email
 * @param password User password
 * @returns Session object if successful, null otherwise
 */
export const signIn = async (email: string, password: string): Promise<Session | null> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error signing in:', error.message);
      return null;
    }

    return data.session;
  } catch (error) {
    console.error('Error in signIn:', error);
    return null;
  }
};

/**
 * Sign up with email and password
 * @param email User email
 * @param password User password
 * @param userName User's display name
 * @returns Object with session (may be null if email confirmation required) and user, or null if error
 */
export const signUp = async (email: string, password: string, userName: string): Promise<{ session: Session | null; user: User | null } | null> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_name: userName,
        },
      },
    });

    if (error) {
      console.error('Error signing up:', error.message);
      return null;
    }

    // Return both session and user - session may be null if email confirmation is required
    return { session: data.session, user: data.user };
  } catch (error) {
    console.error('Error in signUp:', error);
    return null;
  }
};

/**
 * Sign out current user
 * @returns true if successful, false otherwise
 */
export const signOut = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in signOut:', error);
    return false;
  }
};

/**
 * Listen to authentication state changes
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const onAuthStateChange = (
  callback: (session: Session | null) => void
) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session);
    }
  );

  return () => subscription.unsubscribe();
};
