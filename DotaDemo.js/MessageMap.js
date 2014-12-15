(function(global) {
    var DemoMessages = { };
    //DemoMessages[dota.msg.DEM_Error]           =
    DemoMessages[dota.msg.DEM_Stop]              = "CDemoStop";
    DemoMessages[dota.msg.DEM_FileHeader]        = "CDemoFileHeader";
    DemoMessages[dota.msg.DEM_FileInfo]          = "CDemoFileInfo";
    DemoMessages[dota.msg.DEM_SyncTick]          = "CDemoSyncTick";
    DemoMessages[dota.msg.DEM_SendTables]        = "CDemoSendTables";
    DemoMessages[dota.msg.DEM_ClassInfo]         = "CDemoClassInfo";
    DemoMessages[dota.msg.DEM_StringTables]      = "CDemoStringTables";
    DemoMessages[dota.msg.DEM_Packet]            = "CDemoPacket";
    DemoMessages[dota.msg.DEM_SignonPacket]      = "CDemoPacket";
    DemoMessages[dota.msg.DEM_ConsoleCmd]        = "CDemoConsoleCmd";
    DemoMessages[dota.msg.DEM_CustomData]        = "CDemoCustomData";
    DemoMessages[dota.msg.DEM_CustomDataCallbacks] = "CDemoCustomDataCallbacks";
    DemoMessages[dota.msg.DEM_UserCmd]           = "CDemoUserCmd";
    DemoMessages[dota.msg.DEM_FullPacket]        = "CDemoFullPacket";
    DemoMessages[dota.msg.DEM_SaveGame]          = "CDemoSaveGame";

    DemoMessages.isContainer = { };
    DemoMessages.isContainer[dota.msg.DEM_Packet]       = true;
    DemoMessages.isContainer[dota.msg.DEM_SignonPacket] = true;
    DemoMessages.isContainer[dota.msg.DEM_SendTables]   = true;

    var GameMessages = { };
    GameMessages[dota.msg.net_NOP]               = "CNETMsg_NOP";
    GameMessages[dota.msg.net_Disconnect]        = "CNETMsg_Disconnect";
    GameMessages[dota.msg.net_File]              = "CNETMsg_File";
    GameMessages[dota.msg.net_SplitScreenUser]   = "CNETMsg_SplitScreenUser";
    GameMessages[dota.msg.net_Tick]              = "CNETMsg_Tick";
    GameMessages[dota.msg.net_StringCmd]         = "CNETMsg_StringCmd";
    GameMessages[dota.msg.net_SetConVar]         = "CNETMsg_SetConVar";
    GameMessages[dota.msg.net_SignonState]       = "CNETMsg_SignonState";

    GameMessages[dota.msg.svc_ServerInfo]        = "CSVCMsg_ServerInfo";
    GameMessages[dota.msg.svc_SendTable]         = "CSVCMsg_SendTable";
    GameMessages[dota.msg.svc_ClassInfo]         = "CSVCMsg_ClassInfo";
    GameMessages[dota.msg.svc_SetPause]          = "CSVCMsg_SetPause";
    GameMessages[dota.msg.svc_CreateStringTable] = "CSVCMsg_CreateStringTable";
    GameMessages[dota.msg.svc_UpdateStringTable] = "CSVCMsg_UpdateStringTable";
    GameMessages[dota.msg.svc_VoiceInit]         = "CSVCMsg_VoiceInit";
    GameMessages[dota.msg.svc_VoiceData]         = "CSVCMsg_VoiceData";
    GameMessages[dota.msg.svc_Print]             = "CSVCMsg_Print";
    GameMessages[dota.msg.svc_Sounds]            = "CSVCMsg_Sounds";
    GameMessages[dota.msg.svc_SetView]           = "CSVCMsg_SetView";
    GameMessages[dota.msg.svc_FixAngle]          = "CSVCMsg_FixAngle";
    GameMessages[dota.msg.svc_CrosshairAngle]    = "CSVCMsg_CrosshairAngle";
    GameMessages[dota.msg.svc_BSPDecal]          = "CSVCMsg_BSPDecal";
    GameMessages[dota.msg.svc_SplitScreen]       = "CSVCMsg_SplitScreen";
    GameMessages[dota.msg.svc_UserMessage]       = "CSVCMsg_UserMessage";
    //GameMessages[dota.msg.svc_EntityMessage]   =
    GameMessages[dota.msg.svc_GameEvent]         = "CSVCMsg_GameEvent";
    GameMessages[dota.msg.svc_PacketEntities]    = "CSVCMsg_PacketEntities";
    GameMessages[dota.msg.svc_TempEntities]      = "CSVCMsg_TempEntities";
    GameMessages[dota.msg.svc_Prefetch]          = "CSVCMsg_Prefetch";
    GameMessages[dota.msg.svc_Menu]              = "CSVCMsg_Menu";
    GameMessages[dota.msg.svc_GameEventList]     = "CSVCMsg_GameEventList";
    GameMessages[dota.msg.svc_GetCvarValue]      = "CSVCMsg_GetCvarValue";
    GameMessages[dota.msg.svc_PacketReliable]    = "CSVCMsg_PacketReliable";

    var UserMessages = { };
    UserMessages[dota.msg.UM_AchievementEvent]  = "CUserMsg_AchievementEvent";
    UserMessages[dota.msg.UM_CloseCaption]      = "CUserMsg_CloseCaption";
    //UserMessages[dota.msg.UM_CloseCaptionDirect] = ;
    UserMessages[dota.msg.UM_CurrentTimescale]  = "CUserMsg_CurrentTimescale";
    UserMessages[dota.msg.UM_DesiredTimescale]  = "CUserMsg_DesiredTimescale";
    UserMessages[dota.msg.UM_Fade]              = "CUserMsg_Fade";
    UserMessages[dota.msg.UM_GameTitle]         = "CUserMsg_GameTitle";
    UserMessages[dota.msg.UM_Geiger]            = "CUserMsg_Geiger";
    UserMessages[dota.msg.UM_HintText]          = "CUserMsg_HintText";
    UserMessages[dota.msg.UM_HudMsg]            = "CUserMsg_HudMsg";
    UserMessages[dota.msg.UM_HudText]           = "CUserMsg_HudText";
    UserMessages[dota.msg.UM_KeyHintText]       = "CUserMsg_KeyHintText";
    UserMessages[dota.msg.UM_MessageText]       = "CUserMsg_MessageText";
    UserMessages[dota.msg.UM_RequestState]      = "CUserMsg_RequestState";
    UserMessages[dota.msg.UM_ResetHUD]          = "CUserMsg_ResetHUD";
    UserMessages[dota.msg.UM_Rumble]            = "CUserMsg_Rumble";
    UserMessages[dota.msg.UM_SayText]           = "CUserMsg_SayText";
    UserMessages[dota.msg.UM_SayText2]          = "CUserMsg_SayText2";
    UserMessages[dota.msg.UM_SayTextChannel]    = "CUserMsg_SayTextChannel";
    UserMessages[dota.msg.UM_Shake]             = "CUserMsg_Shake";
    UserMessages[dota.msg.UM_ShakeDir]          = "CUserMsg_ShakeDir";
    UserMessages[dota.msg.UM_StatsCrawlMsg]     = "CUserMsg_StatsCrawlMsg";
    UserMessages[dota.msg.UM_StatsSkipState]    = "CUserMsg_StatsSkipState";
    UserMessages[dota.msg.UM_TextMsg]           = "CUserMsg_TextMsg";
    UserMessages[dota.msg.UM_Tilt]              = "CUserMsg_Tilt";
    UserMessages[dota.msg.UM_Train]             = "CUserMsg_Train";
    UserMessages[dota.msg.UM_VGUIMenu]          = "CUserMsg_VGUIMenu";
    UserMessages[dota.msg.UM_VoiceMask]         = "CUserMsg_VoiceMask";
    UserMessages[dota.msg.UM_VoiceSubtitle]     = "CUserMsg_VoiceSubtitle";
    UserMessages[dota.msg.UM_SendAudio]         = "CUserMsg_SendAudio";

    //UserMessages[dota.msg.DOTA_UM_AddUnitToSelection]     =
    UserMessages[dota.msg.DOTA_UM_AIDebugLine]              = "CDOTAUserMsg_AIDebugLine";
    UserMessages[dota.msg.DOTA_UM_ChatEvent]                = "CDOTAUserMsg_ChatEvent";
    UserMessages[dota.msg.DOTA_UM_CombatHeroPositions]      = "CDOTAUserMsg_CombatHeroPositions";
    UserMessages[dota.msg.DOTA_UM_CombatLogData]            = "CDOTAUserMsg_CombatLogData";
    UserMessages[dota.msg.DOTA_UM_CombatLogShowDeath]       = "CDOTAUserMsg_CombatLogShowDeath";
    UserMessages[dota.msg.DOTA_UM_CreateLinearProjectile]   = "CDOTAUserMsg_CreateLinearProjectile";
    UserMessages[dota.msg.DOTA_UM_DestroyLinearProjectile]  = "CDOTAUserMsg_DestroyLinearProjectile";
    UserMessages[dota.msg.DOTA_UM_DodgeTrackingProjectiles] = "CDOTAUserMsg_DodgeTrackingProjectiles";
    UserMessages[dota.msg.DOTA_UM_GlobalLightColor]         = "CDOTAUserMsg_GlobalLightColor";
    UserMessages[dota.msg.DOTA_UM_GlobalLightDirection]     = "CDOTAUserMsg_GlobalLightDirection";
    UserMessages[dota.msg.DOTA_UM_InvalidCommand]           = "CDOTAUserMsg_InvalidCommand";
    UserMessages[dota.msg.DOTA_UM_LocationPing]             = "CDOTAUserMsg_LocationPing";
    UserMessages[dota.msg.DOTA_UM_MapLine]                  = "CDOTAUserMsg_MapLine";
    UserMessages[dota.msg.DOTA_UM_MiniKillCamInfo]          = "CDOTAUserMsg_MiniKillCamInfo";
    UserMessages[dota.msg.DOTA_UM_MinimapDebugPoint]        = "CDOTAUserMsg_MinimapDebugPoint";
    UserMessages[dota.msg.DOTA_UM_MinimapEvent]             = "CDOTAUserMsg_MinimapEvent";
    UserMessages[dota.msg.DOTA_UM_NevermoreRequiem]         = "CDOTAUserMsg_NevermoreRequiem";
    UserMessages[dota.msg.DOTA_UM_OverheadEvent]            = "CDOTAUserMsg_OverheadEvent";
    UserMessages[dota.msg.DOTA_UM_SetNextAutobuyItem]       = "CDOTAUserMsg_SetNextAutobuyItem";
    UserMessages[dota.msg.DOTA_UM_SharedCooldown]           = "CDOTAUserMsg_SharedCooldown";
    UserMessages[dota.msg.DOTA_UM_SpectatorPlayerClick]     = "CDOTAUserMsg_SpectatorPlayerClick";
    UserMessages[dota.msg.DOTA_UM_TutorialTipInfo]          = "CDOTAUserMsg_TutorialTipInfo";
    UserMessages[dota.msg.DOTA_UM_UnitEvent]                = "CDOTAUserMsg_UnitEvent";
    UserMessages[dota.msg.DOTA_UM_ParticleManager]          = "CDOTAUserMsg_ParticleManager";
    UserMessages[dota.msg.DOTA_UM_BotChat]                  = "CDOTAUserMsg_BotChat";
    UserMessages[dota.msg.DOTA_UM_HudError]                 = "CDOTAUserMsg_HudError";
    UserMessages[dota.msg.DOTA_UM_ItemPurchased]            = "CDOTAUserMsg_ItemPurchased";
    UserMessages[dota.msg.DOTA_UM_Ping]                     = "CDOTAUserMsg_Ping";
    UserMessages[dota.msg.DOTA_UM_ItemFound]                = "CDOTAUserMsg_ItemFound";
    //UserMessages[dota.msg.DOTA_UM_CharacterSpeakConcept]  = ;
    UserMessages[dota.msg.DOTA_UM_SwapVerify]               = "CDOTAUserMsg_SwapVerify";
    UserMessages[dota.msg.DOTA_UM_WorldLine]                = "CDOTAUserMsg_WorldLine";
    UserMessages[dota.msg.DOTA_UM_TournamentDrop]           = "CDOTAUserMsg_TournamentDrop";
    UserMessages[dota.msg.DOTA_UM_ItemAlert]                = "CDOTAUserMsg_ItemAlert";
    UserMessages[dota.msg.DOTA_UM_HalloweenDrops]           = "CDOTAUserMsg_HalloweenDrops";
    UserMessages[dota.msg.DOTA_UM_ChatWheel]                = "CDOTAUserMsg_ChatWheel";
    UserMessages[dota.msg.DOTA_UM_ReceivedXmasGift]         = "CDOTAUserMsg_ReceivedXmasGift";
    UserMessages[dota.msg.DOTA_UM_UpdateSharedContent]      = "CDOTAUserMsg_UpdateSharedContent";
    UserMessages[dota.msg.DOTA_UM_TutorialRequestExp]       = "CDOTAUserMsg_TutorialRequestExp";
    UserMessages[dota.msg.DOTA_UM_TutorialPingMinimap]      = "CDOTAUserMsg_TutorialPingMinimap";
    UserMessages[dota.msg.DOTA_UM_GamerulesStateChanged]    = "CDOTA_UM_GamerulesStateChanged";
    UserMessages[dota.msg.DOTA_UM_ShowSurvey]               = "CDOTAUserMsg_ShowSurvey";
    UserMessages[dota.msg.DOTA_UM_TutorialFade]             = "CDOTAUserMsg_TutorialFade";
    UserMessages[dota.msg.DOTA_UM_AddQuestLogEntry]         = "CDOTAUserMsg_AddQuestLogEntry";
    UserMessages[dota.msg.DOTA_UM_SendStatPopup]            = "CDOTAUserMsg_SendStatPopup";
    UserMessages[dota.msg.DOTA_UM_TutorialFinish]           = "CDOTAUserMsg_TutorialFinish";
    UserMessages[dota.msg.DOTA_UM_SendRoshanPopup]          = "CDOTAUserMsg_SendRoshanPopup";
    UserMessages[dota.msg.DOTA_UM_SendGenericToolTip]       = "CDOTAUserMsg_SendGenericToolTip";
    UserMessages[dota.msg.DOTA_UM_SendFinalGold]            = "CDOTAUserMsg_SendFinalGold";
    UserMessages[dota.msg.DOTA_UM_CustomMsg]                = "CDOTAUserMsg_CustomMsg";
    UserMessages[dota.msg.DOTA_UM_CoachHUDPing]             = "CDOTAUserMsg_CoachHUDPing";
    UserMessages[dota.msg.DOTA_UM_ClientLoadGridNav]        = "CDOTAUserMsg_ClientLoadGridNav";
    UserMessages[dota.msg.DOTA_UM_AbilityPing]              = "CDOTAUserMsg_AbilityPing";
    UserMessages[dota.msg.DOTA_UM_ShowGenericPopup]         = "CDOTAUserMsg_ShowGenericPopup";
    UserMessages[dota.msg.DOTA_UM_VoteStart]                = "CDOTAUserMsg_VoteStart";
    UserMessages[dota.msg.DOTA_UM_VoteUpdate]               = "CDOTAUserMsg_VoteUpdate";
    UserMessages[dota.msg.DOTA_UM_VoteEnd]                  = "CDOTAUserMsg_VoteEnd";

    global["dota"]["msg"]["DemoMessages"] = DemoMessages;
    global["dota"]["msg"]["GameMessages"] = GameMessages;
    global["dota"]["msg"]["UserMessages"] = UserMessages;
})(this);
