import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { RepositoriesDataSource } from '../services/repositories-datasource.service';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { DaoService } from '../services/dao.service';
import { GithubService } from '../services/github.service';
import { Store } from '@ngrx/store';
import * as RepositoryAction from '../../stats/store/actions/repository.action';
import * as Reducers from '../../stats/store/reducers/index';

import * as Selector from '../../stats/store/selectors/filter-repositories';

@Component({
  selector: 'app-repositories',
  templateUrl: './repositories.component.html',
  styleUrls: ['./repositories.component.scss']
})
export class RepositoriesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator)
  public paginator!: MatPaginator;
  @ViewChild(MatSort)
  public sort!: MatSort;

  public displayColumns = [
    'name',
    'commits',
    'issues',
    'milestones',
    'projects',
    'pullRequests',
    'releases',
    'stargazers',
    'watchers'
  ];
  public reposDatasource!: RepositoriesDataSource | null | any;
  public loaded = false;
  public repos!: any;
  public reposLength: any;

  public constructor(
    private store: Store<Reducers.IState>,
    private dao: DaoService,
    private gitService: GithubService
  ) {}

  public ngOnInit() {
    this.store.dispatch(new RepositoryAction.GetRepository());
    this.paginator._intl.itemsPerPageLabel = 'Repositories per page';
    this.reposDatasource = new RepositoriesDataSource(
      this.dao,
      this.paginator,
      this.sort,
      this.gitService
    );
    this.store.select('GetRepository', 'reposLength').subscribe(reposLength => {
      if (reposLength) {
        this.reposLength = reposLength;
        this.loaded = true;
      }
    });
    this.store.select(Selector.getRepos).subscribe(repos => {
      this.reposDatasource = new MatTableDataSource(repos);
    });
  }
  public goToNextPage($event) {
    this.store.dispatch(new RepositoryAction.ChangePage($event));
  }

  public ngAfterViewInit() {
    this.reposDatasource.paginator = this.paginator;
    this.reposDatasource.sort = this.sort;
  }

  public applyFilter(filterValue: string) {
    this.reposDatasource.filter = filterValue.trim().toLowerCase();
  }
  public sortData($event) {
    if ($event.direction !== '') {
      this.store.dispatch(new RepositoryAction.FieldFilter($event));
    }
  }
}
