package io.tolgee.repository.activity

import io.tolgee.activity.data.ActivityType
import io.tolgee.model.activity.ActivityDescribingEntity
import io.tolgee.model.activity.ActivityRevision
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface ActivityRevisionRepository : JpaRepository<ActivityRevision, Long> {
  @Query(
    """
    from ActivityRevision ar
    where ar.projectId = :projectId and ar.type is not null and ar.batchJobChunkExecution is null
  """
  )
  fun getForProject(projectId: Long, pageable: Pageable): Page<ActivityRevision>

  @Query(
    """
      select dr
      from ActivityRevision ar 
      join ar.describingRelations dr
      where ar.id in :revisionIds
      and ar.type in :allowedTypes
    """
  )
  fun getRelationsForRevisions(
    revisionIds: List<Long>,
    allowedTypes: Collection<ActivityType>
  ): List<ActivityDescribingEntity>

  @Query(
    """
      select ar.id, me.entityClass, count(me)
      from ActivityRevision ar 
      join ar.modifiedEntities me
      where ar.id in :revisionIds
      and ar.type in :allowedTypes
      group by ar.id, me.entityClass
    """
  )
  fun getModifiedEntityTypeCounts(revisionIds: List<Long>, allowedTypes: Collection<ActivityType>): List<Array<Any>>

  @Query(
    """
      select count(ar.id) as count, function('to_char', ar.timestamp, 'yyyy-MM-dd') as date
      from ActivityRevision ar
      where ar.projectId = :projectId
      group by date
      order by date
    """
  )
  fun getProjectDailyActivity(projectId: Long): List<Array<Any>>
}
