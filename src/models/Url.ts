import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class Url extends Model {
  declare id: number;
  declare original_url: string;
  declare short_code: string;
  declare clicks: number;
  declare readonly created_at: Date;
}

Url.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  original_url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  short_code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  clicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  sequelize,
  modelName: 'Url',
  tableName: 'urls',
  createdAt: 'created_at',
  updatedAt: false
});

export class Click extends Model {
  declare id: number;
  declare short_code: string;
  declare ip: string;
  declare user_agent: string;
  declare readonly clicked_at: Date;
}

Click.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  short_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ip: {
    type: DataTypes.STRING,
  },
  user_agent: {
    type: DataTypes.TEXT,
  }
}, {
  sequelize,
  modelName: 'Click',
  tableName: 'clicks',
  createdAt: 'clicked_at',
  updatedAt: false
});


// For backward compatibility with the existing route logic if needed, 
// though it's better to update the routes to use async/await with these models directly.
export const UrlModel = {
  create: async (originalUrl: string, shortCode: string) => {
    return await Url.create({ original_url: originalUrl, short_code: shortCode });
  },

  findByShortCode: async (shortCode: string) => {
    return await Url.findOne({ where: { short_code: shortCode } });
  },

  incrementClicks: async (shortCode: string) => {
    return await Url.increment('clicks', { where: { short_code: shortCode } });
  },

  getAllUrls: async () => {
    return await Url.findAll({ order: [['created_at', 'DESC']] });
  },

  recordClick: async (shortCode: string, ip?: string, userAgent?: string) => {
    return await Click.create({ short_code: shortCode, ip, user_agent: userAgent });
  },

  getAnalytics: async (shortCode: string) => {
    const { Op, fn, col } = require('sequelize');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const clicks = await Click.findAll({
      where: {
        short_code: shortCode,
        clicked_at: {
          [Op.gte]: sevenDaysAgo
        }
      },
      attributes: [
        [fn('DATE', col('clicked_at')), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: [fn('DATE', col('clicked_at'))],
      order: [[fn('DATE', col('clicked_at')), 'ASC']],
      raw: true
    });

    return clicks;
  }
};
