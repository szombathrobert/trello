// pages/api/set-label.ts

import { db } from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next';

interface Labels {
    label: string;
    labelColor: string;
}

interface SetLabelsRequest {
    cardId: string;
    labels: Labels;
}

interface SetLabelsResponse {
    success: boolean;
    message?: string;
    error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<SetLabelsResponse>) {
    if (req.method !== 'POST') {
        return res.status(405).json({
          error: 'Method not allowed.',
          success: false
        });
    }

    const { cardId, labels }: SetLabelsRequest = req.body;

    try {
        const updatedCard = await db.card.update({
            where: { id: cardId },
            data: {
                label: labels.label,
                labelColor: labels.labelColor
            },
        });

        res.status(200).json({ success: true, message: 'Cimke sikeresen beállitva!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({
          error: 'Internal server error',
          success: false
        });
    }
}