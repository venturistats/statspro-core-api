import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Page, PageDocument } from '../schemas/page.schema';
import { Model } from 'mongoose';
import { PageType } from '../enum/page-type.enum';

@Injectable()
export class PageRepository {
  constructor(@InjectModel(Page.name) private pageModel: Model<PageDocument>) {}

  async findPagesByType(pageType: PageType | PageType[]): Promise<Page[]> {
    const pageTypeFilter = Array.isArray(pageType)
      ? { page_type: { $in: pageType } }
      : { page_type: pageType };

    return this.pageModel
      .find(pageTypeFilter, {
        slug_url: 1,
        page_type: 1,
        last_updated_at: 1,
        _id: 0,
      })
      .lean()
      .exec();
  }

  async create(data: Partial<Page>): Promise<Page> {
    return this.pageModel.create(data);
  }

  async findAll(): Promise<Page[]> {
    return this.pageModel.find().exec();
  }

  async findById(id: string): Promise<Page | null> {
    return this.pageModel.findById(id).exec();
  }

}
