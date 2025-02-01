const Event = require("@base/event");
const { getGuild } = require("@schemas/Guild");
const { Events, ChannelType, PermissionFlagsBits, Guild, VoiceState } = require("discord.js");

const temp_channels = {};

class VoiceStateUpdate extends Event {
    constructor(client) {
        super(client, {
            eventName: Events.VoiceStateUpdate
        });
    }

    /**
     * Execute the event
     * @param {VoiceState} oldMember
     * @param {VoiceState} newMember
     * @returns {Promise<void>}
     */
    async execute(oldMember, newMember) {
        const { guild } = newMember;
        const joined = Boolean(newMember.channelId);
        const channelId = newMember.channelId || oldMember.channelId;

        if (joined) {
            this.#onJoin(newMember, channelId, guild);
        } else {
            this.#onLeave(oldMember, channelId, guild);
        }
    }

    /**
     * On channel joined
     * @param {VoiceState} newMember
     * @param {string} channelId
     * @param {Guild} guild
     * @returns {Promise<void>}
     */
    async #onJoin(newMember, channelId, guild) {
        const parent = newMember.channel?.parent;
        const data = (await getGuild(guild.id)).temp_channels.some(id => id === channelId);

        if (!data) return;

        const channel = await guild.channels.create({
            name: newMember.member.displayName,
            parent,
            permissionOverwrites: [{ id: newMember.id, allow: [PermissionFlagsBits.ManageChannels] }],
            type: ChannelType.GuildVoice
        });

        newMember
            .setChannel(channel)
            .then(() => {
                temp_channels[guild.id] = temp_channels[guild.id] || {};
                temp_channels[guild.id][channel.id] = channel;
            })
            .catch(() => {
                channel.delete().catch(() => {});
            });
    }

    /**
     * On channel leaved
     * @param {VoiceState} _
     * @param {string} channelId
     * @param {Guild} guild
     * @returns {Promise<void>}
     */
    async #onLeave(_, channelId, guild) {
        const channel = temp_channels[guild.id]?.[channelId];
        if (!channel) return;

        delete temp_channels[guild.id][channelId];
        await channel.delete().catch(() => {});
    }
}

module.exports = VoiceStateUpdate;
