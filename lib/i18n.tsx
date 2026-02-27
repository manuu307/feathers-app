'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'es' | 'pt';

export const translations = {
  en: {
    nav: {
      home: 'Home',
      write: 'Write',
      seek: 'Seek',
      profile: 'Profile',
      leave: 'Leave',
      refresh: 'Refresh Letters',
    },
    mailbox: {
      title: 'The Mailbox',
      empty: 'The winds have brought no news today.',
      sendBird: 'Send a bird',
      fromBeyond: 'From the Beyond',
      sealedScroll: 'A sealed scroll awaits your eyes...',
      inbox: 'Inbox',
      saved: 'Saved',
      all: 'All',
      noSaved: 'You have no saved scrolls.',
    },
    writing: {
      title: 'Compose Scroll',
      recipient: 'Recipient Address',
      placeholder: 'My dearest friend, the sun rises over the valley...',
      selectSeal: 'Select Seal',
      noStamps: 'No stamps available',
      dispatch: 'Dispatch',
      preparing: 'The bird prepares...',
      success: 'Your bird {name} has taken flight.',
      addPage: 'Add Page',
      removePage: 'Remove Page',
      page: 'Page',
    },
    reading: {
      received: 'Scroll Received',
      regards: 'With regards,',
      traveler: 'A Traveler of the Realm',
      page: 'Page',
      next: 'Next Page',
      prev: 'Previous Page',
      tags: 'Tags',
      addTag: 'Add tag...',
      saveOrDrop: 'Save or Drop?',
      saveOrDropDesc: 'Do you wish to keep this scroll in your archives or let it fade into memory?',
      save: 'Save',
      drop: 'Drop',
    },
    profile: {
      title: 'Character Sheet',
      subtitle: 'Your identity in the realm',
      identity: 'Identity',
      fullName: 'Full Name',
      birthDate: 'Birth Date',
      realmAddress: 'Realm Address',
      addressNote: 'Address cannot be changed.',
      companion: 'Companion',
      birdName: 'Bird Name',
      birdType: 'Bird Type',
      edit: 'Edit Profile',
      cancel: 'Cancel',
      save: 'Save Changes',
      saving: 'Saving...',
    },
    search: {
      title: 'Seek Others',
      subtitle: 'Find fellow travelers across the realm',
      placeholder: 'Search by name or address...',
      searching: 'Scouring the archives...',
      noResults: 'No souls found matching your query.',
      initial: 'Enter a name to begin your search.',
      write: 'Write',
    },
    birds: {
      owl: 'Owl',
      raven: 'Raven',
      dove: 'Dove',
      falcon: 'Falcon',
    }
  },
  es: {
    nav: {
      home: 'Inicio',
      write: 'Escribir',
      seek: 'Buscar',
      profile: 'Perfil',
      leave: 'Salir',
      refresh: 'Refrescar Cartas',
    },
    mailbox: {
      title: 'El Buzón',
      empty: 'Los vientos no han traído noticias hoy.',
      sendBird: 'Enviar un ave',
      fromBeyond: 'Desde el Más Allá',
      sealedScroll: 'Un pergamino sellado espera tus ojos...',
      inbox: 'Bandeja',
      saved: 'Guardados',
      all: 'Todos',
      noSaved: 'No tienes pergaminos guardados.',
    },
    writing: {
      title: 'Componer Pergamino',
      recipient: 'Dirección del Destinatario',
      placeholder: 'Mi querido amigo, el sol sale sobre el valle...',
      selectSeal: 'Seleccionar Sello',
      noStamps: 'No hay sellos disponibles',
      dispatch: 'Despachar',
      preparing: 'El ave se prepara...',
      success: 'Tu ave {name} ha emprendido el vuelo.',
      addPage: 'Añadir Página',
      removePage: 'Eliminar Página',
      page: 'Página',
    },
    reading: {
      received: 'Pergamino Recibido',
      regards: 'Atentamente,',
      traveler: 'Un Viajero del Reino',
      page: 'Página',
      next: 'Siguiente Página',
      prev: 'Página Anterior',
      tags: 'Etiquetas',
      addTag: 'Añadir etiqueta...',
      saveOrDrop: '¿Guardar o Soltar?',
      saveOrDropDesc: '¿Deseas mantener este pergamino en tus archivos o dejar que se desvanezca en la memoria?',
      save: 'Guardar',
      drop: 'Soltar',
    },
    profile: {
      title: 'Ficha de Personaje',
      subtitle: 'Tu identidad en el reino',
      identity: 'Identidad',
      fullName: 'Nombre Completo',
      birthDate: 'Fecha de Nacimiento',
      realmAddress: 'Dirección del Reino',
      addressNote: 'La dirección no se puede cambiar.',
      companion: 'Compañero',
      birdName: 'Nombre del Ave',
      birdType: 'Tipo de Ave',
      edit: 'Editar Perfil',
      cancel: 'Cancelar',
      save: 'Guardar Cambios',
      saving: 'Guardando...',
    },
    search: {
      title: 'Buscar a Otros',
      subtitle: 'Encuentra a otros viajeros por el reino',
      placeholder: 'Buscar por nombre o dirección...',
      searching: 'Buscando en los archivos...',
      noResults: 'No se encontraron almas que coincidan con tu búsqueda.',
      initial: 'Ingresa un nombre para comenzar tu búsqueda.',
      write: 'Escribir',
    },
    birds: {
      owl: 'Búho',
      raven: 'Cuervo',
      dove: 'Paloma',
      falcon: 'Halcón',
    }
  },
  pt: {
    nav: {
      home: 'Início',
      write: 'Escrever',
      seek: 'Buscar',
      profile: 'Perfil',
      leave: 'Sair',
      refresh: 'Atualizar Cartas',
    },
    mailbox: {
      title: 'A Caixa de Correio',
      empty: 'Os ventos não trouxeram notícias hoje.',
      sendBird: 'Enviar uma ave',
      fromBeyond: 'Do Além',
      sealedScroll: 'Um pergaminho selado aguarda seus olhos...',
      inbox: 'Entrada',
      saved: 'Salvos',
      all: 'Todos',
      noSaved: 'Você não tem pergaminhos salvos.',
    },
    writing: {
      title: 'Compor Pergaminho',
      recipient: 'Endereço do Destinatário',
      placeholder: 'Meu querido amigo, o sol nasce sobre o vale...',
      selectSeal: 'Selecionar Selo',
      noStamps: 'Nenhum selo disponível',
      dispatch: 'Despachar',
      preparing: 'A ave está se preparando...',
      success: 'Sua ave {name} levantou voo.',
      addPage: 'Adicionar Página',
      removePage: 'Remover Página',
      page: 'Página',
    },
    reading: {
      received: 'Pergaminho Recebido',
      regards: 'Atenciosamente,',
      traveler: 'Um Viajante do Reino',
      page: 'Página',
      next: 'Próxima Página',
      prev: 'Página Anterior',
      tags: 'Tags',
      addTag: 'Adicionar tag...',
      saveOrDrop: 'Salvar ou Largar?',
      saveOrDropDesc: 'Deseja manter este pergaminho em seus arquivos ou deixá-lo desaparecer na memória?',
      save: 'Salvar',
      drop: 'Largar',
    },
    profile: {
      title: 'Ficha de Personagem',
      subtitle: 'Sua identidade no reino',
      identity: 'Identidade',
      fullName: 'Nome Completo',
      birthDate: 'Data de Nascimento',
      realmAddress: 'Endereço do Reino',
      addressNote: 'O endereço não pode ser alterado.',
      companion: 'Companheiro',
      birdName: 'Nome da Ave',
      birdType: 'Tipo de Ave',
      edit: 'Editar Perfil',
      cancel: 'Cancelar',
      save: 'Salvar Alterações',
      saving: 'Salvando...',
    },
    search: {
      title: 'Buscar Outros',
      subtitle: 'Encontre outros viajantes pelo reino',
      placeholder: 'Buscar por nome ou endereço...',
      searching: 'Vasculhando os arquivos...',
      noResults: 'Nenhuma alma encontrada correspondente à sua busca.',
      initial: 'Digite um nome para começar sua busca.',
      write: 'Escrever',
    },
    birds: {
      owl: 'Coruja',
      raven: 'Corvo',
      dove: 'Pomba',
      falcon: 'Falcão',
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'es' || savedLang === 'pt')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
