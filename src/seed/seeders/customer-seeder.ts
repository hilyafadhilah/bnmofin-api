/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
import { faker } from '@faker-js/faker';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import axios from 'axios';
import { getStorage } from 'firebase-admin/storage';
import { DataSource } from 'typeorm';
import { CustomerFactory } from '../factories/customer-factory';
import { mimeExt } from '../../utils/fileupload-utils';

export class CustomerSeeder extends Seeder {
  async run(dataSource: DataSource) {
    const customers = await new CustomerFactory().createMany(200);
    const bucket = getStorage().bucket();

    await Promise
      .all(
        customers.map(async (customer) => {
          const url = faker.image.image(
            faker.datatype.number({ min: 200, max: 2000 }),
            faker.datatype.number({ min: 200, max: 2000 }),
            true,
          );

          const { data, headers } = await axios.get<ArrayBuffer>(
            url,
            { responseType: 'arraybuffer' },
          );

          if (!(headers['content-type'] in mimeExt)) {
            throw new Error('Unsupported image type.');
          }

          const ext = (mimeExt as any)[headers['content-type']];
          const fname = customer.idCardImage.replace(/.(\w)+$/, `.${ext}`);

          // eslint-disable-next-line no-param-reassign
          customer.idCardImage = fname;
          dataSource.manager.save(customer);

          const file = bucket.file(fname);
          const stream = file.createWriteStream({ resumable: false });
          stream.write(Buffer.from(data));
          stream.end();
        }),
      );
  }
}
