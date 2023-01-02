import { hideLinkEmbed, hyperlink, MessageType } from 'discord.js';
import { ImagesCommonService } from './ImagesCommonService.js';
import { TranslateCode } from '../constant/TranslateCode.js';
import { Translate } from '../common/Translate.js';

import type { Message, RepliableInteraction } from 'discord.js';
import type { ImageUrlPair, ImageUrlsMap, ReplyPayload } from '../common/typing';

export class ShowImagesService extends ImagesCommonService {
	public async fetchReplyedMessage(message: Message<true>): Promise<Message<true> | null> {
		const referenceMessageId = message.reference?.messageId;

		if (!referenceMessageId || message.type !== MessageType.Reply) {
			return null;
		}

		try {
			return await message.channel.messages.fetch({ message: referenceMessageId });
		} catch {
			return null;
		}
	}

	public isShowable(message: Message<true>): boolean {
		return this.containsSomeImages(message);
	}

	public makeReplyPayloads(message: Message<true>, locale: string): ReplyPayload[] {
		return this.convertToPayloads(this.collectImageUrlsMap(message), locale);
	}

	public async sendPayloads(interaction: RepliableInteraction, payloads: ReplyPayload[]): Promise<void> {
		await interaction.reply(payloads[0]);
		await Promise.all(payloads.slice(1).map((payload) => interaction.followUp(payload)));
	}

	private convertToPayloads(imageUrlsMap: ImageUrlsMap, locale: string): ReplyPayload[] {
		return [...imageUrlsMap].reduce(
			(payloads, imageUrlPair) => this.imageUrlsToPayload(payloads, imageUrlPair, locale),
			new Array<ReplyPayload>()
		);
	}

	private imageUrlsToPayload(payloads: ReplyPayload[], imageUrlPair: ImageUrlPair, locale: string): ReplyPayload[] {
		const [siteUrl, imageUrls] = imageUrlPair;

		return payloads.concat({
			content: hyperlink(Translate.do(TranslateCode.L0000000, {}, locale), hideLinkEmbed(siteUrl)),
			files: imageUrls,
			ephemeral: true,
			fetchReply: true,
		});
	}
}
