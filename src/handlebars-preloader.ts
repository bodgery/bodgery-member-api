import * as Handlebars from 'handlebars';
import * as fs from 'fs';

export class handlebars {
    private path: string;
    private tmpl_by_name = {};

    constructor(path: string) {
        this.path = path;
    }

    public load(callback: () => void): void {
        // TODO A lot of redundancy in this. Clean up.
        let partials_path = this.path + '/partials';
        fs.readdir(partials_path, (err, files) => {
            if (err) throw err;

            let promises = files.map(_ => {
                let clean_name = _;
                clean_name = clean_name.replace('^' + partials_path, '');
                clean_name = clean_name.replace(/.handlebars/, '');

                let file_path = partials_path + '/' + _;

                return file_path.match(/\.handlebars$/)
                    ? new Promise((resolve, reject) => {
                          fs.readFile(file_path, (err, data) => {
                              if (err) reject(err);

                              let compiled_partial = Handlebars.compile(
                                  data.toString(),
                              );
                              Handlebars.registerPartial(
                                  clean_name,
                                  compiled_partial,
                              );
                              resolve();
                          });
                      })
                    : // Ignore non handlebars files
                      new Promise((resolve, reject) => resolve());
            });

            Promise.all(promises).then(values => {
                fs.readdir(this.path, (err, files) => {
                    if (err) throw err;

                    let promises = files.map(_ => {
                        let clean_name = _;
                        clean_name = clean_name.replace('^' + this.path, '');
                        clean_name = clean_name.replace(/.handlebars/, '');

                        let file_path = this.path + '/' + _;

                        return file_path.match(/\.handlebars$/)
                            ? new Promise((resolve, reject) => {
                                  fs.readFile(file_path, (err, data) => {
                                      if (err) reject(err);

                                      let tmpl = Handlebars.compile(
                                          data.toString(),
                                      );
                                      this.tmpl_by_name[clean_name] = tmpl;
                                      resolve();
                                  });
                              })
                            : // Ignore non handlebars files
                              new Promise((resolve, reject) => resolve());
                    });

                    Promise.all(promises).then(values => {
                        callback();
                    });
                });
            });
        });
    }

    public execute(tmpl_name: string, params: any): string {
        let tmpl = this.tmpl_by_name[tmpl_name];
        if (!tmpl) {
            throw new Error(
                'No template found for ' + tmpl_name + ' under ' + this.path,
            );
        }

        let text = tmpl(params);
        return text;
    }
}
